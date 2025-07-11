import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_BUCKET_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    throw new Error('Missing required AWS configuration. Check your .env file.');
}

// Configure AWS with explicit credentials
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Test AWS credentials on startup
const testS3Connection = async () => {
    try {
        await s3Client.config.credentials();
        console.log('AWS credentials validated successfully');
    } catch (error) {
        console.error('AWS credentials validation failed:', error);
        throw new Error('Invalid AWS credentials. Please check your AWS configuration.');
    }
};

testS3Connection();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP files are allowed.'), false);
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload to S3
export const uploadToS3 = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
      }
  
        // Validate AWS credentials before upload
        try {
            await s3Client.config.credentials();
        } catch (error) {
            console.error('AWS credentials validation failed:', error);
            return res.status(500).json({
                success: false,
                error: 'AWS configuration error. Please contact administrator.'
            });
        }

        const fileExtension = path.extname(req.file.originalname);
        const fileName = `${Date.now()}${fileExtension}`;

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `deals/${fileName}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'public-read'
          };
  
        try {
            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);
          
            // Construct the URL for the uploaded image
            const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/deals/${fileName}`;

            res.status(200).json({
                success: true,
                imageUrl: imageUrl
            });
        } catch (uploadError) {
            console.error('S3 upload error:', uploadError);
            res.status(500).json({
                success: false,
                error: 'Failed to upload to S3. Please try again.'
            });
        }

    } catch (error) {
        console.error('Error uploading to S3:', error);
      res.status(500).json({ 
            success: false,
            error: error.message || 'Error uploading image'
      });
    }
  };
