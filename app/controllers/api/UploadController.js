const Foto = require('#models/Foto');
const Ensaio = require('#models/Ensaio');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = function UploadController() {
  
  const _uploadFotos = async (req, res) => {
    try {
      const { ensaioId } = req.body;
      const files = req.files;
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          error: 'Nenhum arquivo foi enviado'
        });
      }
      
      // Verificar se o ensaio existe
      const ensaio = await Ensaio.findByPk(ensaioId);
      if (!ensaio) {
        return res.status(404).json({
          error: 'Ensaio não encontrado'
        });
      }
      
      const fotosProcessadas = [];
      
      // Processar cada foto
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Obter informações da imagem
          const metadata = await sharp(file.path).metadata();
          
          // Criar thumbnail
          const thumbnailPath = file.path.replace(
            path.extname(file.path), 
            '_thumb' + path.extname(file.path)
          );
          
          await sharp(file.path)
            .resize(300, 300, { 
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
          
          // Salvar no banco de dados
          const foto = await Foto.create({
            ensaioId: ensaioId,
            nomeArquivo: file.originalname,
            caminhoArquivo: file.path,
            tamanhoArquivo: file.size,
            largura: metadata.width,
            altura: metadata.height,
            tipoArquivo: path.extname(file.originalname).substring(1),
            ordem: i + 1
          });
          
          fotosProcessadas.push({
            id: foto.id,
            nomeArquivo: foto.nomeArquivo,
            largura: foto.largura,
            altura: foto.altura,
            tamanhoArquivo: foto.tamanhoArquivo,
            ordem: foto.ordem
          });
          
        } catch (processError) {
          console.error('Erro ao processar foto:', processError);
          // Continuar com as outras fotos
        }
      }
      
      // Atualizar quantidade de fotos no ensaio
      await ensaio.update({
        quantidadeFotos: await Foto.count({ where: { ensaioId } })
      });
      
      return res.status(200).json({
        message: `${fotosProcessadas.length} fotos enviadas com sucesso`,
        fotos: fotosProcessadas,
        ensaioId: ensaioId
      });
      
    } catch (error) {
      console.error('Erro no upload:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _getFotosEnsaio = async (req, res) => {
    try {
      const { ensaioId } = req.params;
      
      const fotos = await Foto.findAll({
        where: { ensaioId },
        order: [['ordem', 'ASC'], ['createdAt', 'ASC']]
      });
      
      return res.status(200).json({
        fotos: fotos.map(foto => ({
          id: foto.id,
          nomeArquivo: foto.nomeArquivo,
          largura: foto.largura,
          altura: foto.altura,
          tamanhoArquivo: foto.tamanhoArquivo,
          ordem: foto.ordem,
          destaque: foto.destaque,
          aprovadaCliente: foto.aprovadaCliente,
          createdAt: foto.createdAt
        }))
      });
      
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _deleteFoto = async (req, res) => {
    try {
      const { fotoId } = req.params;
      
      const foto = await Foto.findByPk(fotoId);
      if (!foto) {
        return res.status(404).json({
          error: 'Foto não encontrada'
        });
      }
      
      // Deletar arquivo físico
      if (fs.existsSync(foto.caminhoArquivo)) {
        fs.unlinkSync(foto.caminhoArquivo);
      }
      
      // Deletar thumbnail se existir
      const thumbnailPath = foto.caminhoArquivo.replace(
        path.extname(foto.caminhoArquivo), 
        '_thumb' + path.extname(foto.caminhoArquivo)
      );
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
      
      // Deletar do banco
      await foto.destroy();
      
      return res.status(200).json({
        message: 'Foto deletada com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  const _updateOrdemFotos = async (req, res) => {
    try {
      const { fotosOrdem } = req.body; // Array de { id, ordem }
      
      for (const item of fotosOrdem) {
        await Foto.update(
          { ordem: item.ordem },
          { where: { id: item.id } }
        );
      }
      
      return res.status(200).json({
        message: 'Ordem das fotos atualizada com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      return res.status(500).json({
        error: 'Erro interno no servidor'
      });
    }
  };
  
  return {
    uploadFotos: _uploadFotos,
    getFotosEnsaio: _getFotosEnsaio,
    deleteFoto: _deleteFoto,
    updateOrdemFotos: _updateOrdemFotos
  };
};

