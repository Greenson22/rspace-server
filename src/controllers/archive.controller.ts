// src/controllers/archive.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as archiveService from '../services/archive.service';

export const handleArchiveUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req sudah memiliki req.user dari middleware jwtAuth
        const result = await archiveService.archiveDiscussionsService(req);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const getArchivedTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId; // Ambil ID pengguna
        const topics = await archiveService.getArchivedTopicsService(userId); // Teruskan ID
        res.status(200).json(topics);
    } catch (error) {
        next(error);
    }
};

export const getArchivedSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId; // Ambil ID pengguna
        const { topicName } = req.params;
        const subjects = await archiveService.getArchivedSubjectsService(userId, topicName); // Teruskan ID
        res.status(200).json(subjects);
    } catch (error) {
        next(error);
    }
};

export const getArchivedDiscussions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId; // Ambil ID pengguna
        const { topicName, subjectName } = req.params;
        const discussions = await archiveService.getArchivedDiscussionsService(userId, topicName, subjectName); // Teruskan ID
        res.status(200).json(discussions);
    } catch (error) {
        next(error);
    }
};