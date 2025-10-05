import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configurar multer para armazenar em memória
const storage = multer.memoryStorage();

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use apenas JPG, PNG, GIF ou WEBP.'), false);
  }
};

// Configurar multer com limite de 2MB
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB em bytes
  },
  fileFilter: fileFilter
});

// POST - Upload de imagem única
// O campo deve se chamar 'image' no form-data
router.post('/image', (req, res) => {
  upload.single('image')(req, res, (err) => {
    // Tratamento de erros do multer
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          message: 'Arquivo muito grande. O tamanho máximo é 2MB.' 
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          success: false, 
          message: 'Campo inválido. Use o campo "image" para enviar o arquivo.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }

    // Verificar se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo foi enviado. Certifique-se de usar o campo "image".' 
      });
    }

    // Converter para Base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Calcular tamanho para exibição
    const sizeInKB = Buffer.byteLength(base64Image, 'utf8') / 1024;
    const sizeInMB = sizeInKB / 1024;
    
    const sizeFormatted = sizeInMB >= 1 
      ? `${sizeInMB.toFixed(2)}MB` 
      : `${sizeInKB.toFixed(2)}KB`;

    res.json({ 
      success: true, 
      message: 'Imagem convertida com sucesso!',
      data: {
        base64: base64Image,
        size: sizeFormatted,
        mimetype: req.file.mimetype,
        originalName: req.file.originalname
      }
    });
  });
});

// POST - Upload de múltiplas imagens (máximo 5)
// Os campos devem se chamar 'images' no form-data
router.post('/images', (req, res) => {
  upload.array('images', 5)(req, res, (err) => {
    // Tratamento de erros do multer
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          message: 'Um ou mais arquivos são muito grandes. O tamanho máximo é 2MB por imagem.' 
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          success: false, 
          message: 'Campo inválido. Use o campo "images" para enviar os arquivos.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }

    // Verificar se arquivos foram enviados
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo foi enviado. Certifique-se de usar o campo "images".' 
      });
    }

    // Converter todos os arquivos para Base64
    const base64Images = [];
    
    for (const file of req.files) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const sizeInKB = Buffer.byteLength(base64Image, 'utf8') / 1024;
      const sizeInMB = sizeInKB / 1024;

      const sizeFormatted = sizeInMB >= 1 
        ? `${sizeInMB.toFixed(2)}MB` 
        : `${sizeInKB.toFixed(2)}KB`;

      base64Images.push({
        base64: base64Image,
        size: sizeFormatted,
        mimetype: file.mimetype,
        originalName: file.originalname
      });
    }

    res.json({ 
      success: true, 
      message: `${base64Images.length} imagem(ns) convertida(s) com sucesso!`,
      data: base64Images
    });
  });
});

export default router;