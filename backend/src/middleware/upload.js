const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_IMAGES = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_DOCS   = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar'];
const ALLOWED_ALL    = [...ALLOWED_IMAGES, ...ALLOWED_DOCS];

const fileFilter = (allowed) => (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error(`Tipo de arquivo não permitido: ${ext}`));
};

const memoryStorage = multer.memoryStorage();

const rename = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  return `${uuidv4()}${ext}`;
};

// Upload de imagem (avatar, logo)
const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(ALLOWED_IMAGES),
});

// Upload de documento (KYC, comprovantes)
const uploadDocument = multer({
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter(ALLOWED_ALL),
});

// Upload de evidência de disputa (aceita tudo)
const uploadEvidence = multer({
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter(ALLOWED_ALL),
});

// Middleware de erro do multer
const handleMulterError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Limite excedido.' });
    }
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
};

module.exports = { uploadImage, uploadDocument, uploadEvidence, handleMulterError, rename };
