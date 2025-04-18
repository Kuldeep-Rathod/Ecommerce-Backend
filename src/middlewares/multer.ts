import multer from 'multer';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads');
    },
    filename: (req, file, callback) => {
        const id = uuid();
        const extensionName = file.originalname.split('.').pop();
        const filename = `${id}.${extensionName}`;

        callback(null, filename);
    },
});

// Single file upload middleware (for photos)
export const singleUpload = multer({ storage }).single('photo');

// Multiple files upload middleware (for images)
export const multipleUpload = multer({ storage }).array('images', 5); // Allows up to 5 images
