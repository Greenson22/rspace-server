// src/services/discussion_file.service.ts

import path from 'path';
import fs from 'fs';
import { rootPath } from '../config/path';

const metadataPath = path.join(rootPath, 'storage', 'Discussion_data', 'metadata.json');

// Interface untuk struktur metadata diskusi
interface DiscussionMetadata {
    lastUploadedAt: string;
    uploadedAtFormatted: string;
}

export const getDiscussionMetadataService = (): DiscussionMetadata | null => {
    if (!fs.existsSync(metadataPath)) {
        // Jika file metadata tidak ada, berarti belum pernah ada unggahan.
        return null;
    }

    const fileContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: DiscussionMetadata = JSON.parse(fileContent);
    
    return metadata;
};