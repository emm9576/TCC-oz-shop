import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// Função auxiliar para fazer upload no Cloudinary
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const base64Image = `data:${mimetype};base64,${buffer.toString('base64')}`;

    cloudinary.uploader.upload(
      base64Image,
      {
        folder: 'oz-shop',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

// POST - Upload de imagem única
// O campo deve se chamar 'image' no form-data
router.post('/image', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    // Verificar se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado. Certifique-se de usar o campo "image".'
      });
    }
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

    try {
      // Upload para Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

      // Calcular tamanho para exibição
      const sizeInKB = req.file.size / 1024;
      const sizeInMB = sizeInKB / 1024;

      const sizeFormatted = sizeInMB >= 1 ? `${sizeInMB.toFixed(2)}MB` : `${sizeInKB.toFixed(2)}KB`;

      res.json({
        success: true,
        message: 'Imagem enviada com sucesso!',
        data: {
          url: result.secure_url,
          size: sizeFormatted,
          mimetype: req.file.mimetype,
          originalName: req.file.originalname
        }
      });
    } catch (error) {
      console.error('Erro ao enviar para Cloudinary:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload da imagem.'
      });
    }
  });
});

// POST - Upload de múltiplas imagens (máximo 5)
// Os campos devem se chamar 'images' no form-data
router.post('/images', (req, res) => {
  upload.array('images', 5)(req, res, async (err) => {
    // Verificar se arquivos foram enviados
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado. Certifique-se de usar o campo "images".'
      });
    }

    // Tratamento de erros do multer
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Arquivos muito grandes. O tamanho máximo é 2MB por imagem.'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Campo inválido. Use o campo "images" para enviar arquivos.'
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

    try {
      // Upload de todos os arquivos para Cloudinary
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, file.mimetype)
      );

      const results = await Promise.all(uploadPromises);

      // Formatar resposta com informações das imagens
      const imagesData = results.map((result, index) => {
        const file = req.files[index];
        const sizeInKB = file.size / 1024;
        const sizeInMB = sizeInKB / 1024;

        const sizeFormatted =
          sizeInMB >= 1 ? `${sizeInMB.toFixed(2)}MB` : `${sizeInKB.toFixed(2)}KB`;

        return {
          url: result.secure_url,
          size: sizeFormatted,
          mimetype: file.mimetype,
          originalName: file.originalname
        };
      });

      res.json({
        success: true,
        message: `${imagesData.length} imagem(ns) enviada(s) com sucesso!`,
        data: imagesData
      });
    } catch (error) {
      console.error('Erro ao enviar para Cloudinary:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload das imagens.'
      });
    }
  });
});

export default router;
