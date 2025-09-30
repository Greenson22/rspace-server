// src/controllers/archive.controller.ts

import { Request, Response, NextFunction } from 'express';
import { 
    archiveDiscussionsService,
    getArchivedTopicsService,
    getArchivedSubjectsService,
    getArchivedDiscussionsService,
    getArchivedFileService
} from '../services/archive.service';

export const handleArchiveUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await archiveDiscussionsService(req);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const getArchivedTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const topics = await getArchivedTopicsService(userId);
        res.status(200).json(topics);
    } catch (error) {
        next(error);
    }
};

export const getArchivedSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { topicName } = req.params;
        const subjects = await getArchivedSubjectsService(userId, topicName);
        res.status(200).json(subjects);
    } catch (error) {
        next(error);
    }
};

export const getArchivedDiscussions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { topicName, subjectName } = req.params;
        const discussions = await getArchivedDiscussionsService(userId, topicName, subjectName);
        res.status(200).json(discussions);
    } catch (error) {
        next(error);
    }
};

export const downloadArchivedFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const filePath = req.query.path as string;
        if (!filePath) {
            return res.status(400).json({ message: 'Query parameter "path" dibutuhkan.' });
        }
        
        const fileDetails = await getArchivedFileService(userId, filePath);
        
        res.download(fileDetails.filePath, fileDetails.originalName, (err) => {
            if (err) {
                console.error("Error saat mengirim file arsip:", err);
            }
        });
    } catch (error) {
        next(error);
    }
};