const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'photos');

// Configurar multer para upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use apenas imagens (JPG, PNG, GIF, WebP).'));
    }
  }
});

// Middleware para processar upload
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Função principal do endpoint
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar token de autorização
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        details: 'É necessário estar logado para fazer upload de fotos'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: 'Token inválido',
        details: 'Faça login novamente'
      });
    }

    // Processar upload
    await runMiddleware(req, res, upload.single('photo'));

    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo fornecido',
        details: 'Por favor, selecione uma imagem para upload'
      });
    }

    // Criar diretório se não existir
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const filename = `${decoded.userId}_${timestamp}_${randomStr}${fileExtension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Processar imagem com Sharp (redimensionar e otimizar)
    let processedImage = sharp(req.file.buffer);

    // Obter informações da imagem
    const metadata = await processedImage.metadata();
    
    // Redimensionar se necessário (máximo 800x800)
    if (metadata.width > 800 || metadata.height > 800) {
      processedImage = processedImage.resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Otimizar baseado no tipo
    if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg') {
      processedImage = processedImage.jpeg({ quality: 85 });
    } else if (req.file.mimetype === 'image/png') {
      processedImage = processedImage.png({ quality: 85 });
    } else if (req.file.mimetype === 'image/webp') {
      processedImage = processedImage.webp({ quality: 85 });
    }

    // Salvar arquivo processado
    await processedImage.toFile(filepath);

    // Obter informações do arquivo final
    const stats = fs.statSync(filepath);
    const photoUrl = `/uploads/photos/${filename}`;

    // Conectar ao banco de dados
    const db = await getDatabase();

    // Registrar upload na tabela de uploads
    const uploadId = db.generateId();
    await db.run(
      `INSERT INTO uploads (
        id, user_id, original_filename, stored_filename, 
        file_path, file_type, file_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uploadId,
        decoded.userId,
        req.file.originalname,
        filename,
        photoUrl,
        req.file.mimetype,
        stats.size
      ]
    );

    // Atualizar foto do perfil
    await db.run(
      'UPDATE profiles SET photo_url = ? WHERE user_id = ?',
      [photoUrl, decoded.userId]
    );

    // Buscar dados atualizados do usuário
    const userData = await db.get(
      `SELECT 
        u.name,
        u.email,
        u.username,
        p.photo_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?`,
      [decoded.userId]
    );

    // Log do upload
    console.log(`Upload de foto realizado: ${decoded.userId} - ${filename}`);

    // Retornar sucesso
    res.status(200).json({
      success: true,
      message: 'Foto enviada com sucesso!',
      data: {
        photoUrl,
        filename,
        originalName: req.file.originalname,
        size: stats.size,
        user: {
          name: userData.name,
          email: userData.email,
          username: userData.username,
          photo: userData.photo_url
        }
      }
    });

  } catch (error) {
    console.error('Erro no upload da foto:', error);

    // Tratar erros específicos
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'Arquivo muito grande',
        details: 'O arquivo deve ter no máximo 5MB'
      });
    }

    if (error.message.includes('Tipo de arquivo não permitido')) {
      return res.status(400).json({
        error: 'Tipo de arquivo inválido',
        details: error.message
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      details: 'Não foi possível processar o upload. Tente novamente.'
    });
  }
}

// Configuração para Next.js/Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};
