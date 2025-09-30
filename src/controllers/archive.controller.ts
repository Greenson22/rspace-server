// src/controllers/archive.controller.ts

import { Request, Response, NextFunction } from 'express';
import { 
    archiveDiscussionsService,
    getArchivedTopicsService,
    getArchivedSubjectsService,
    getArchivedDiscussionsService
} from '../services/archive.service';

export const handleArchiveUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await archiveDiscussionsService(req);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// --- HANDLER BARU UNTUK MENGAMBIL DATA ARSIP ---

export const getArchivedTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topics = await getArchivedTopicsService();
        res.status(200).json(topics);
    } catch (error) {
        next(error);
    }
};

export const getArchivedSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { topicName } = req.params;
        const subjects = await getArchivedSubjectsService(topicName);
        res.status(200).json(subjects);
    } catch (error) {
        next(error);
    }
};

export const getArchivedDiscussions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { topicName, subjectName } = req.params;
        const discussions = await getArchivedDiscussionsService(topicName, subjectName);
        res.status(200).json(discussions);
    } catch (error) {
        next(error);
    }
};