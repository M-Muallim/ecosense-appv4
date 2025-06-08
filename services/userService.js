// Replace with your actual PC IP address below
const API_BASE = 'http://192.168.1.124:3001';

export async function getUserProfile(firebaseUid) {
  try {
    const response = await fetch(`${API_BASE}/users/${firebaseUid}`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    const user = await response.json();

    // Fetch leaderboard entry for this user
    let level = 1;
    try {
      const leaderboardRes = await fetch(`${API_BASE}/leaderboard/${firebaseUid}`);
      if (leaderboardRes.ok) {
        const leaderboard = await leaderboardRes.json();
        level = leaderboard.level;
      }
    } catch (e) {
      console.error('Error fetching leaderboard for user:', e);
    }

    // Normalize keys for frontend
    return {
      ...user,
      photoURL: user.photoUrl,
      displayName: user.displayName,
      bio: user.bio,
      createdAt: user.createdAt,
      level, // Add level from leaderboard
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getLeaderboardData() {
  try {
    const response = await fetch(`${API_BASE}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function updateUserProfile(firebaseUid, updates) {
  try {
    const response = await fetch(`${API_BASE}/users/${firebaseUid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update user profile');
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

export async function getUserChallenges(firebaseUid) {
  try {
    const response = await fetch(`${API_BASE}/users/${firebaseUid}/challenges`);
    if (!response.ok) throw new Error('Failed to fetch user challenges');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return [];
  }
}

export async function getUserWeeklyStats(firebaseUid) {
  try {
    const response = await fetch(`${API_BASE}/users/${firebaseUid}/stats`);
    if (!response.ok) throw new Error('Failed to fetch user stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {};
  }
}

export async function getUserLevel(firebaseUid) {
  try {
    const response = await fetch(`${API_BASE}/users/${firebaseUid}/level`);
    if (!response.ok) throw new Error('Failed to fetch user level');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user level:', error);
    return { level: 1, progress: 0, needed: 24, total: 0 };
  }
}

export async function completeUserChallenge(firebaseUid, challengeId, weekStart) {
  try {
    const response = await fetch(`${API_BASE}/users/${firebaseUid}/complete-challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, weekStart }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error completing user challenge:', error);
    return { error: 'Failed to complete challenge' };
  }
} 