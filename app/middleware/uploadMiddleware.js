const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do diretório de upload
const uploadDir = path.join(__dirname, '../../uploads');

// Criar diretório se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Criar subdiretório por ensaio se especificado
    const ensaioId = req.body.ensaioId || 'temp';
    const ensaioDir = path.join(uploadDir, `ensaio_${ensaioId}`);
    
    if (!fs.existsSync(ensaioDir)) {
      fs.mkdirSync(ensaioDir, { recursive: true });
    }
    
    cb(null, ensaioDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `foto_${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas JPEG, PNG e WebP são aceitos.'), false);
  }
};

// Configuração do middleware de upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 50 // Máximo 50 arquivos por upload
  }
});

module.exports = {
  // Upload múltiplo de fotos
  uploadMultiple: upload.array('fotos', 50),
  
  // Upload único
  uploadSingle: upload.single('foto'),
  
  // Middleware de tratamento de erros
  handleUploadError: (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Arquivo muito grande. Tamanho máximo: 10MB'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Muitos arquivos. Máximo: 50 arquivos'
        });
      }
    }
    
    if (error.message.includes('Tipo de arquivo não permitido')) {
      return res.status(400).json({
        error: error.message
      });
    }
    
    return res.status(500).json({
      error: 'Erro interno no upload'
    });
  }
};

