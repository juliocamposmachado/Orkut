const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { getDatabase } = require('./database');

// Configurações do Google Drive
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1UtRjJo3J62950uPXsKR8F1FAlOSG0QzZ';
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

// Função para autenticar com Google Drive
async function authenticateGoogleDrive() {
  try {
    let credentials;
    
    if (SERVICE_ACCOUNT_KEY) {
      // Produção: usar variável de ambiente
      credentials = JSON.parse(SERVICE_ACCOUNT_KEY);
    } else {
      // Desenvolvimento: usar arquivo local
      const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
      if (fs.existsSync(credentialsPath)) {
        credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      } else {
        throw new Error('Credenciais do Google Drive não encontradas');
      }
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Erro na autenticação do Google Drive:', error);
    throw error;
  }
}

// Função para fazer backup do banco de dados
async function backupDatabase() {
  try {
    const db = await getDatabase();
    const backupPath = await db.backup();
    
    console.log(`Backup local criado: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Erro ao criar backup do banco:', error);
    throw error;
  }
}

// Função para fazer upload do backup para Google Drive
async function uploadBackupToDrive(backupPath) {
  try {
    const drive = await authenticateGoogleDrive();
    const backupName = `orkut_backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}.db`;

    const fileMetadata = {
      name: backupName,
      parents: [GOOGLE_DRIVE_FOLDER_ID]
    };

    const media = {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(backupPath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,size,createdTime'
    });

    console.log(`Backup enviado para Google Drive: ${response.data.name} (ID: ${response.data.id})`);
    
    // Remover backup local após upload bem-sucedido
    fs.unlinkSync(backupPath);
    
    return {
      fileId: response.data.id,
      fileName: response.data.name,
      fileSize: response.data.size,
      uploadTime: response.data.createdTime
    };
  } catch (error) {
    console.error('Erro ao enviar backup para Google Drive:', error);
    throw error;
  }
}

// Função para listar backups no Google Drive
async function listBackupsFromDrive() {
  try {
    const drive = await authenticateGoogleDrive();
    
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and name contains 'orkut_backup' and trashed=false`,
      orderBy: 'createdTime desc',
      fields: 'files(id,name,size,createdTime,modifiedTime)'
    });

    return response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      size: parseInt(file.size) || 0,
      createdAt: file.createdTime,
      modifiedAt: file.modifiedTime
    }));
  } catch (error) {
    console.error('Erro ao listar backups do Google Drive:', error);
    throw error;
  }
}

// Função para baixar backup do Google Drive
async function downloadBackupFromDrive(fileId, destinationPath) {
  try {
    const drive = await authenticateGoogleDrive();
    
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, { responseType: 'stream' });

    const dest = fs.createWriteStream(destinationPath);
    
    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        console.log(`Backup baixado: ${destinationPath}`);
        resolve(destinationPath);
      });
      
      response.data.on('error', err => {
        console.error('Erro ao baixar backup:', err);
        reject(err);
      });
      
      response.data.pipe(dest);
    });
  } catch (error) {
    console.error('Erro ao baixar backup do Google Drive:', error);
    throw error;
  }
}

// Função para remover backups antigos (manter apenas os 10 mais recentes)
async function cleanOldBackups() {
  try {
    const backups = await listBackupsFromDrive();
    
    if (backups.length > 10) {
      const drive = await authenticateGoogleDrive();
      const backupsToDelete = backups.slice(10); // Pegar todos após os 10 primeiros
      
      console.log(`Removendo ${backupsToDelete.length} backups antigos...`);
      
      for (const backup of backupsToDelete) {
        await drive.files.delete({
          fileId: backup.id
        });
        console.log(`Backup removido: ${backup.name}`);
      }
    }
    
    return backups.length;
  } catch (error) {
    console.error('Erro ao limpar backups antigos:', error);
    throw error;
  }
}

// Função para exportar dados em JSON para backup adicional
async function exportUserDataToJSON() {
  try {
    const db = await getDatabase();
    
    const userData = {
      users: await db.all('SELECT * FROM users'),
      profiles: await db.all('SELECT * FROM profiles'),
      friendships: await db.all('SELECT * FROM friendships'),
      scraps: await db.all('SELECT * FROM scraps'),
      communities: await db.all('SELECT * FROM communities'),
      community_members: await db.all('SELECT * FROM community_members'),
      posts: await db.all('SELECT * FROM posts'),
      messages: await db.all('SELECT * FROM messages'),
      uploads: await db.all('SELECT * FROM uploads'),
      exportDate: new Date().toISOString()
    };

    const exportPath = path.join(process.cwd(), 'data', `export_${Date.now()}.json`);
    fs.writeFileSync(exportPath, JSON.stringify(userData, null, 2));
    
    console.log(`Dados exportados para: ${exportPath}`);
    return exportPath;
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    throw error;
  }
}

// Endpoint principal
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'create':
        // Criar backup e enviar para Google Drive
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Método não permitido' });
        }

        const backupPath = await backupDatabase();
        const uploadResult = await uploadBackupToDrive(backupPath);
        await cleanOldBackups();

        res.status(200).json({
          success: true,
          message: 'Backup criado e enviado com sucesso!',
          data: uploadResult
        });
        break;

      case 'list':
        // Listar backups disponíveis
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Método não permitido' });
        }

        const backups = await listBackupsFromDrive();
        
        res.status(200).json({
          success: true,
          data: {
            backups,
            total: backups.length
          }
        });
        break;

      case 'download':
        // Baixar backup específico
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Método não permitido' });
        }

        const { fileId } = req.query;
        if (!fileId) {
          return res.status(400).json({ error: 'ID do arquivo não fornecido' });
        }

        const downloadPath = path.join(process.cwd(), 'data', `restored_${Date.now()}.db`);
        await downloadBackupFromDrive(fileId, downloadPath);

        res.status(200).json({
          success: true,
          message: 'Backup baixado com sucesso!',
          data: { downloadPath }
        });
        break;

      case 'export':
        // Exportar dados em JSON
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Método não permitido' });
        }

        const exportPath = await exportUserDataToJSON();
        
        res.status(200).json({
          success: true,
          message: 'Dados exportados com sucesso!',
          data: { exportPath }
        });
        break;

      case 'auto':
        // Backup automático (para cron jobs)
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Método não permitido' });
        }

        // Verificar se já foi feito backup hoje
        const backupsList = await listBackupsFromDrive();
        const today = new Date().toISOString().slice(0, 10);
        const todayBackup = backupsList.find(backup => 
          backup.name.includes(today)
        );

        if (todayBackup) {
          return res.status(200).json({
            success: true,
            message: 'Backup já realizado hoje',
            data: todayBackup
          });
        }

        // Criar backup automático
        const autoBackupPath = await backupDatabase();
        const autoUploadResult = await uploadBackupToDrive(autoBackupPath);
        await cleanOldBackups();

        res.status(200).json({
          success: true,
          message: 'Backup automático realizado com sucesso!',
          data: autoUploadResult
        });
        break;

      default:
        res.status(400).json({
          error: 'Ação não reconhecida',
          details: 'Ações disponíveis: create, list, download, export, auto'
        });
    }

  } catch (error) {
    console.error('Erro no sistema de backup:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
