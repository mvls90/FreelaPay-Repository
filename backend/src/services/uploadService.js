const path = require('path');
const fs   = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

// ── Escolhe provider baseado em variáveis de ambiente ────────────
const useS3 = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_BUCKET);

let s3 = null;
if (useS3) {
  try {
    const AWS = require('aws-sdk');
    s3 = new AWS.S3({
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region:          process.env.AWS_REGION || 'sa-east-1',
    });
  } catch {
    logger.warn('AWS SDK não disponível — usando armazenamento local');
  }
}

// ── Upload local (fallback / desenvolvimento) ────────────────────
const LOCAL_DIR = path.join(process.cwd(), 'uploads');
if (!useS3 && !fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

/**
 * Faz upload de um buffer para S3 ou disco local.
 * @param {Buffer} buffer   Conteúdo do arquivo
 * @param {string} mimetype MIME type do arquivo
 * @param {string} folder   Pasta lógica (avatars | documents | evidence | updates)
 * @param {string} [ext]    Extensão incluindo ponto (.jpg)
 * @returns {Promise<string>} URL pública ou caminho relativo
 */
const upload = async (buffer, mimetype, folder = 'misc', ext = '.bin') => {
  const filename = `${folder}/${uuidv4()}${ext}`;

  if (useS3 && s3) {
    const params = {
      Bucket:      process.env.AWS_BUCKET,
      Key:         filename,
      Body:        buffer,
      ContentType: mimetype,
      ACL:         'public-read',
    };
    const result = await s3.upload(params).promise();
    logger.info(`Upload S3: ${result.Location}`);
    return result.Location;
  }

  // Local
  const destDir  = path.join(LOCAL_DIR, folder);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, path.basename(filename));
  fs.writeFileSync(destPath, buffer);
  const url = `/uploads/${filename}`;
  logger.info(`Upload local: ${url}`);
  return url;
};

/**
 * Remove arquivo do S3 ou disco local.
 * @param {string} fileUrl URL/caminho retornado pelo upload()
 */
const remove = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    if (useS3 && s3 && fileUrl.startsWith('http')) {
      const url = new URL(fileUrl);
      const key = url.pathname.slice(1); // remove leading "/"
      await s3.deleteObject({ Bucket: process.env.AWS_BUCKET, Key: key }).promise();
    } else {
      const localPath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
  } catch (err) {
    logger.error(`Erro ao remover arquivo ${fileUrl}: ${err.message}`);
  }
};

module.exports = { upload, remove };
