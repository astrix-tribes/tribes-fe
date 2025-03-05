import express from 'express';
import debug from 'debug';
import { getPrisma } from '../database.js';

const router = express.Router();
const usersDebug = debug('tribes:users');

// Get all users
router.get('/', async (req, res) => {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            tribes: true,
            posts: true,
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    usersDebug('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        tribes: true,
        ownedTribes: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    usersDebug('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user by address
router.get('/address/:address', async (req, res) => {
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { address: req.params.address },
      include: {
        tribes: true,
        ownedTribes: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    usersDebug('Error fetching user by address:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { address, username, bio, avatar } = req.body;

    const user = await prisma.user.create({
      data: {
        address,
        username,
        bio,
        avatar,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    usersDebug('Error creating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Username or address already exists',
        field: error.meta?.target?.[0]
      });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { username, bio, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        username,
        bio,
        avatar,
      },
    });

    res.json(user);
  } catch (error) {
    usersDebug('Error updating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (error) {
    usersDebug('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Check if username is available
router.get('/check-username/:username', async (req, res) => {
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true },
    });

    res.json({ available: !user });
  } catch (error) {
    usersDebug('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

export default router; 