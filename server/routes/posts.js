import express from 'express';
import debug from 'debug';
import { getPrisma } from '../database.js';

const router = express.Router();
const postsDebug = debug('tribes:posts');

// Get all posts
router.get('/', async (req, res, next) => {
  try {
    postsDebug('Fetching all posts with params:', req.query);
    const { limit = 20, offset = 0 } = req.query;
    
    const prisma = getPrisma();
    const posts = await prisma.post.findMany({
      where: { isDeleted: false },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });
    
    postsDebug(`Retrieved ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    postsDebug('Error fetching posts:', error);
    next(error);
  }
});

// Get a single post by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    postsDebug(`Fetching post with ID: ${id}`);
    
    const prisma = getPrisma();
    const post = await prisma.post.findUnique({
      where: { id },
    });
    
    if (!post) {
      postsDebug(`Post with ID ${id} not found`);
      return res.status(404).json({ error: 'Post not found' });
    }
    
    postsDebug(`Retrieved post: ${id}`);
    res.json(post);
  } catch (error) {
    postsDebug(`Error fetching post ${req.params.id}:`, error);
    next(error);
  }
});

// Get posts by tribe
router.get('/tribe/:tribeId', async (req, res, next) => {
  try {
    const { tribeId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    postsDebug(`Fetching posts for tribe: ${tribeId} with limit: ${limit}, offset: ${offset}`);
    
    const prisma = getPrisma();
    const posts = await prisma.post.findMany({
      where: { 
        tribeId,
        isDeleted: false,
      },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });
    
    postsDebug(`Retrieved ${posts.length} posts for tribe ${tribeId}`);
    res.json(posts);
  } catch (error) {
    postsDebug(`Error fetching posts for tribe ${req.params.tribeId}:`, error);
    next(error);
  }
});

// Get posts by user (feed)
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    postsDebug(`Fetching feed for user: ${userId} with limit: ${limit}, offset: ${offset}`);
    
    const prisma = getPrisma();
    const posts = await prisma.post.findMany({
      where: {
        author: userId,
        isDeleted: false,
      },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });
    
    postsDebug(`Retrieved ${posts.length} posts for user ${userId}`);
    res.json(posts);
  } catch (error) {
    postsDebug(`Error fetching posts for user ${req.params.userId}:`, error);
    next(error);
  }
});

// Create a new post
router.post('/', async (req, res, next) => {
  try {
    postsDebug('Creating new post with data:', JSON.stringify(req.body));
    
    const { id, author, content, type, timestamp, tribeId, metadata, stats, blockchainId } = req.body;
    
    // Validate required fields
    if (!id || !author || !content || !tribeId) {
      postsDebug('Invalid post data - missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const prisma = getPrisma();
    const post = await prisma.post.create({
      data: {
        id,
        author,
        content,
        type,
        timestamp: new Date(timestamp || Date.now()),
        likes: 0,
        comments: 0,
        shares: 0,
        tribeId,
        metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {}),
        stats: typeof stats === 'string' ? stats : JSON.stringify(stats || {}),
        blockchainId,
      },
    });
    
    postsDebug(`Created post with ID: ${post.id}`);
    res.status(201).json(post);
  } catch (error) {
    postsDebug('Error creating post:', error);
    next(error);
  }
});

export default router; 