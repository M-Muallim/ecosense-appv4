const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require('cloudinary').v2;
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dgcdkuyew',
  api_key: '918895263956994',
  api_secret: 'q2oo2s6MU0MPIFsmMeeieiSQyS0',
});

// Test route
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Get all users
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoUrl, bio } = req.body;
    const user = await prisma.user.create({
      data: {
        firebaseUid,
        email,
        displayName,
        photoUrl,
        bio,
      },
    });

    // Create the leaderboard entry for this user
    await prisma.leaderboard.create({
      data: {
        userId: user.id,
        level: 1, // Start at level 1
        weightedScore: 0,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get a single user by firebaseUid
app.get('/users/:firebaseUid', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update a user by firebaseUid
app.put('/users/:firebaseUid', async (req, res) => {
  try {
    const { displayName, photoUrl, bio } = req.body;
    const user = await prisma.user.update({
      where: { firebaseUid: req.params.firebaseUid },
      data: { displayName, photoUrl, bio },
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get leaderboard entry by firebaseUid
app.get('/leaderboard/:firebaseUid', async (req, res) => {
  try {
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find the leaderboard entry for this user
    const leaderboard = await prisma.leaderboard.findFirst({
      where: { userId: user.id },
    });
    if (!leaderboard) return res.status(404).json({ error: 'Leaderboard entry not found' });

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get a user's assigned challenges for the current week
app.get('/users/:firebaseUid/challenges', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get start of current week (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    // Get current week's challenges
    const weekChallenges = await prisma.currentWeekChallenge.findMany({
      where: { weekStart },
      include: { challenge: true },
    });

    // Get all recycled items for this user for the week
    const recycled = await prisma.recycledItem.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: weekStart },
      },
    });
    // Expanded type mapping for all variants and plurals
    const TYPE_MAP = {
      plastic: 'plastic', plastics: 'plastic',
      glass: 'glass', glasses: 'glass',
      metal: 'metal', metals: 'metal',
      paper: 'paper', papers: 'paper',
      cardboard: 'cardboard', cardboards: 'cardboard',
      clothes: 'clothes', clothing: 'clothes',
      organic: 'organic', organicwaste: 'organic', waste: 'organic',
      bottle: 'glass', bottles: 'glass',
      box: 'cardboard', boxes: 'cardboard',
      can: 'metal', cans: 'metal',
      item: '', items: '', // fallback, will be ignored
    };
    // Count by mapped type (case-insensitive)
    const stats = {};
    for (const item of recycled) {
      const mappedType = TYPE_MAP[item.type.toLowerCase()] || item.type.toLowerCase();
      stats[mappedType] = (stats[mappedType] || 0) + 1;
    }

    const userChallenges = [];
    for (const wc of weekChallenges) {
      // Use composite unique key for userChallenge
      let uc = await prisma.userChallenge.findUnique({
        where: {
          userId_challengeId_weekStart: {
            userId: user.id,
            challengeId: wc.challengeId,
            weekStart,
          }
        }
      });
      if (!uc) {
        try {
          uc = await prisma.userChallenge.create({
            data: {
              userId: user.id,
              challengeId: wc.challengeId,
              weekStart,
              completed: false,
              completedAt: null,
            },
          });
        } catch (err) {
          if (err.code === 'P2002') {
            // Row was created by another process, fetch it
            uc = await prisma.userChallenge.findUnique({
              where: {
                userId_challengeId_weekStart: {
                  userId: user.id,
                  challengeId: wc.challengeId,
                  weekStart,
                }
              }
            });
          } else {
            throw err;
          }
        }
      }
      let shouldComplete = false;
      // Match any word after the count (e.g., 'Recycle 10 Glass Items', 'Recycle 10 Plastics', etc.)
      const title = wc.challenge.title.toLowerCase();
      const singleTypeMatch = title.match(/recycle (\d+) ([a-z]+)/);
      if (singleTypeMatch) {
        const required = parseInt(singleTypeMatch[1], 10);
        let type = singleTypeMatch[2];
        type = TYPE_MAP[type] || type;
        const userCount = stats[type] || 0;
        if (userCount >= required) shouldComplete = true;
      }
      // TODO: Add multi-type and special challenge logic here
      if (!uc.completed && shouldComplete) {
        await prisma.userChallenge.update({
          where: { id: uc.id },
          data: { completed: true, completedAt: new Date() },
        });
        await prisma.leaderboard.updateMany({
          where: { userId: user.id },
          data: { weightedScore: { increment: wc.challenge.points } },
        });
        uc.completed = true;
        uc.completedAt = new Date();
      }
      userChallenges.push({
        id: uc.id,
        challengeId: wc.challengeId,
        title: wc.challenge.title,
        description: wc.challenge.description,
        points: wc.challenge.points,
        completed: uc.completed,
        completedAt: uc.completedAt,
      });
    }
    res.json(userChallenges);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ error: 'Failed to fetch user challenges' });
  }
});

// Get a user's recycling stats for the current week
app.get('/users/:firebaseUid/stats', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get start of current week (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const recycled = await prisma.recycledItem.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: weekStart },
      },
    });

    // Expanded type mapping for all variants and plurals
    const TYPE_MAP = {
      plastic: 'plastic', plastics: 'plastic',
      glass: 'glass', glasses: 'glass',
      metal: 'metal', metals: 'metal',
      paper: 'paper', papers: 'paper',
      cardboard: 'cardboard', cardboards: 'cardboard',
      clothes: 'clothes', clothing: 'clothes',
      organic: 'organic', organicwaste: 'organic', waste: 'organic',
      bottle: 'glass', bottles: 'glass',
      box: 'cardboard', boxes: 'cardboard',
      can: 'metal', cans: 'metal',
      item: '', items: '', // fallback, will be ignored
    };
    // Count by mapped type (case-insensitive)
    const stats = {};
    for (const item of recycled) {
      const mappedType = TYPE_MAP[item.type.toLowerCase()] || item.type.toLowerCase();
      stats[mappedType] = (stats[mappedType] || 0) + 1;
    }
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Level calculation utility
function getLevelProgress(totalItems) {
  let level, start, needed;
  if (totalItems < 216) {
    level = Math.floor(totalItems / 24) + 1;
    start = (level - 1) * 24;
    needed = 24;
  } else if (totalItems < 696) {
    level = Math.floor((totalItems - 216) / 48) + 10;
    start = 216 + (level - 10) * 48;
    needed = 48;
  } else if (totalItems < 1556) {
    level = Math.floor((totalItems - 696) / 86) + 20;
    start = 696 + (level - 20) * 86;
    needed = 86;
  } else if (totalItems < 1644) {
    level = 30;
    start = 1556;
    needed = 88;
  } else {
    level = 30;
    start = 1556;
    needed = 88;
  }
  const progress = totalItems - start;
  return { level, progress, needed, total: totalItems };
}

// Get a user's level and progress
app.get('/users/:firebaseUid/level', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.params.firebaseUid },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get leaderboard entry
    let leaderboard = await prisma.leaderboard.findFirst({ where: { userId: user.id } });
    if (!leaderboard) {
      leaderboard = await prisma.leaderboard.create({
        data: { userId: user.id, level: 1, weightedScore: 0, leveledUpAt: new Date() },
      });
    }

    // Only count recycled items after leveledUpAt for progress
    const recycled = await prisma.recycledItem.findMany({
      where: {
        userId: user.id,
        createdAt: { gt: leaderboard.leveledUpAt },
      },
    });
    const total = recycled.length;
    const result = getLevelProgress(total);

    // If calculated level is higher, update DB and leveledUpAt
    if (result.level > leaderboard.level) {
      await prisma.leaderboard.update({
        where: { id: leaderboard.id },
        data: { level: result.level, leveledUpAt: new Date() },
      });
      leaderboard.level = result.level;
      leaderboard.leveledUpAt = new Date();
    }

    res.json({
      level: leaderboard.level,
      progress: result.progress,
      needed: result.needed,
      total: result.total,
    });
  } catch (error) {
    console.error('Error fetching user level:', error);
    res.status(500).json({ error: 'Failed to fetch user level' });
  }
});

// Cloudinary signed upload endpoint
app.post('/upload-profile-image', upload.single('file'), async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    if (!firebaseUid || !req.file) {
      return res.status(400).json({ error: 'firebaseUid and file are required' });
    }
    // Upload to Cloudinary with overwrite enabled
    const result = await cloudinary.uploader.upload_stream(
      {
        public_id: `users/${firebaseUid}`,
        overwrite: true,
        resource_type: 'image',
        folder: 'users',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Cloudinary upload failed' });
        }
        return res.json({ secure_url: result.secure_url });
      }
    );
    // Write the file buffer to the upload stream
    result.end(req.file.buffer);
  } catch (err) {
    console.error('Signed upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Weighted points for each class
const ITEM_POINTS = {
  plastic: 10,
  clothes: 10,
  metal: 7,
  glass: 7,
  paper: 4,
  cardboard: 4,
  organicwaste: 4,
};

// Create a new recycled item and update weightedScore
app.post('/users/:firebaseUid/recycled-items', async (req, res) => {
  try {
    const { type, locationId } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });
    const points = ITEM_POINTS[type.toLowerCase()] || 1;
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.params.firebaseUid } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Create recycled item
    const recycledItem = await prisma.recycledItem.create({
      data: {
        userId: user.id,
        type,
        locationId: locationId || null,
      },
    });
    // Update leaderboard weightedScore
    await prisma.leaderboard.updateMany({
      where: { userId: user.id },
      data: { weightedScore: { increment: points } },
    });
    res.status(201).json({ recycledItem, pointsAdded: points });
  } catch (error) {
    console.error('Error creating recycled item:', error);
    res.status(500).json({ error: 'Failed to create recycled item' });
  }
});

// Complete a challenge and add its points to weightedScore
app.post('/users/:firebaseUid/complete-challenge', async (req, res) => {
  try {
    const { challengeId, weekStart } = req.body;
    if (!challengeId || !weekStart) return res.status(400).json({ error: 'challengeId and weekStart are required' });
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.params.firebaseUid } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Find the userChallenge for this week
    const userChallenge = await prisma.userChallenge.findFirst({
      where: {
        userId: user.id,
        challengeId: challengeId,
        weekStart: new Date(weekStart),
      },
    });
    if (!userChallenge) return res.status(404).json({ error: 'UserChallenge not found' });
    if (userChallenge.completed) return res.status(400).json({ error: 'Challenge already completed' });
    // Get challenge points
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    // Mark as completed
    await prisma.userChallenge.update({
      where: { id: userChallenge.id },
      data: { completed: true, completedAt: new Date() },
    });
    // Add points to leaderboard
    await prisma.leaderboard.updateMany({
      where: { userId: user.id },
      data: { weightedScore: { increment: challenge.points } },
    });
    res.json({ success: true, pointsAdded: challenge.points });
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

// Get the top 10 users for the leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboardEntries = await prisma.leaderboard.findMany({
      orderBy: { weightedScore: 'desc' },
      take: 10,
      include: {
        user: true,
      },
    });
    const result = leaderboardEntries.map((entry, idx) => ({
      id: entry.user.id,
      name: entry.user.displayName || entry.user.email.split('@')[0],
      avatar: entry.user.photoUrl || 'https://via.placeholder.com/100',
      level: entry.level,
      weightedScore: entry.weightedScore,
      rank: idx + 1,
    }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});