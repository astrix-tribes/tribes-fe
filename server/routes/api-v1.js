import express from 'express';

const router = express.Router();

// Get all users
router.get('/health', async (req, res) => {
  try {
    return res.json({ message: 'app is running' });
  } catch (error) {
    usersDebug('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


export default router; 