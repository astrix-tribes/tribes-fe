import express from 'express';
import debug from 'debug';
import { getPrisma } from '../database.js';

const router = express.Router();
const tribesDebug = debug('tribes:tribes');

// Get all tribes
router.get('/', async (req, res) => {
  try {
    const prisma = getPrisma();
    const tribes = await prisma.tribe.findMany({
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });
    res.json(tribes);
  } catch (error) {
    tribesDebug('Error fetching tribes:', error);
    res.status(500).json({ error: 'Failed to fetch tribes' });
  }
});

// Get a specific tribe by ID
router.get('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const tribe = await prisma.tribe.findUnique({
      where: { id: req.params.id },
      include: {
        owner: true,
        members: true,
        topics: true,
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    if (!tribe) {
      return res.status(404).json({ error: 'Tribe not found' });
    }

    res.json(tribe);
  } catch (error) {
    tribesDebug('Error fetching tribe:', error);
    res.status(500).json({ error: 'Failed to fetch tribe' });
  }
});

// Create a new tribe
router.post('/', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { name, description, ownerId } = req.body;

    const tribe = await prisma.tribe.create({
      data: {
        name,
        description,
        owner: {
          connect: { id: ownerId },
        },
        members: {
          connect: { id: ownerId }, // Owner is automatically a member
        },
      },
      include: {
        owner: true,
        members: true,
      },
    });

    res.status(201).json(tribe);
  } catch (error) {
    tribesDebug('Error creating tribe:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Tribe name already exists' });
    }
    res.status(500).json({ error: 'Failed to create tribe' });
  }
});

// Update a tribe
router.put('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { name, description, isPrivate } = req.body;

    const tribe = await prisma.tribe.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        isPrivate,
      },
      include: {
        owner: true,
        members: true,
      },
    });

    res.json(tribe);
  } catch (error) {
    tribesDebug('Error updating tribe:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Tribe name already exists' });
    }
    res.status(500).json({ error: 'Failed to update tribe' });
  }
});

// Add a member to a tribe
router.post('/:id/members', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { userId } = req.body;

    const tribe = await prisma.tribe.update({
      where: { id: req.params.id },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        members: true,
      },
    });

    res.json(tribe);
  } catch (error) {
    tribesDebug('Error adding member to tribe:', error);
    res.status(500).json({ error: 'Failed to add member to tribe' });
  }
});

// Remove a member from a tribe
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id, userId } = req.params;

    const tribe = await prisma.tribe.update({
      where: { id },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
      include: {
        members: true,
      },
    });

    res.json(tribe);
  } catch (error) {
    tribesDebug('Error removing member from tribe:', error);
    res.status(500).json({ error: 'Failed to remove member from tribe' });
  }
});

// Delete a tribe
router.delete('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    await prisma.tribe.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (error) {
    tribesDebug('Error deleting tribe:', error);
    res.status(500).json({ error: 'Failed to delete tribe' });
  }
});

export default router; 