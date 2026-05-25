import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOADS_BASE = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');
const AVATAR_DIR = path.join(UPLOADS_BASE, 'avatars');

// 确保目录存在
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const personId = req.params.id;
    const ext = path.extname(file.originalname) || '.png';
    const timestamp = Date.now();
    cb(null, `avatar-${personId}-${timestamp}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('仅支持 JPG、PNG、GIF、WEBP 格式的图片'));
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');
