// src/routes/social.routes.ts
import { Router, Request, Response } from 'express';
import * as socialService from '../services/social.service';

const router = Router();

// GET Feed
router.get('/feed', async (req: Request, res: Response) => {
    try {
        const posts = await socialService.getAllPosts(req.user.userId);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat feed.' });
    }
});

// POST Create Post
router.post('/post', async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Konten tidak boleh kosong' });
        
        await socialService.createPost(req.user.userId, content);
        res.status(201).json({ message: 'Postingan berhasil dibuat' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat postingan.' });
    }
});

// POST Like/Unlike
router.post('/post/:id/like', async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id);
        const result = await socialService.toggleLike(req.user.userId, postId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Gagal melakukan aksi like.' });
    }
});

// GET Comments
router.get('/post/:id/comments', async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id);
        const comments = await socialService.getComments(postId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat komentar.' });
    }
});

// POST Add Comment
router.post('/post/:id/comment', async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id);
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Komentar kosong' });

        const result = await socialService.addComment(req.user.userId, postId, content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengirim komentar.' });
    }
});

export default router;