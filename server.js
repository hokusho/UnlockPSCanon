const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PORT = 5050;
const ROOT = __dirname;
const ENGINE_PATH = path.join(ROOT, 'unlocker_engine.ps1');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.pf3': 'application/octet-stream',
  '.pf2': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Endpoint: /api/unlock
  if (req.method === 'POST' && req.url.startsWith('/api/unlock')) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      let tempInPath = null;
      let tempOutPath = null;
      try {
        const bodyBuffer = Buffer.concat(chunks);
        
        let fileBuffer = bodyBuffer;
        let originalFileName = 'picture_style.pf3';
        const contentType = req.headers['content-type'] || '';
        
        if (contentType.includes('multipart/form-data')) {
          const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
          const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;
          if (boundary) {
            const separator = Buffer.from('--' + boundary.trim());
            const parts = [];
            let start = 0;
            
            while ((start = bodyBuffer.indexOf(separator, start)) !== -1) {
              const next = bodyBuffer.indexOf(separator, start + separator.length);
              if (next !== -1) {
                parts.push(bodyBuffer.slice(start + separator.length, next));
              }
              start += separator.length;
            }

            for (const part of parts) {
              const headerEnd = part.indexOf('\r\n\r\n');
              if (headerEnd !== -1) {
                const header = part.slice(0, headerEnd).toString();
                if (header.includes('filename=')) {
                  const match = header.match(/filename="?([^"\r\n]+)"?/);
                  if (match && match[1]) {
                    originalFileName = path.basename(match[1]);
                  }
                  // File content is between headerEnd + 4 and part.length - 2 (\r\n)
                  fileBuffer = part.slice(headerEnd + 4, part.length - 2);
                  break;
                }
              }
            }
          }
        }

        console.log(`[Upload] Recebido: ${originalFileName} (${fileBuffer.length} bytes)`);

        if (fileBuffer.length < 32) {
          throw new Error('Arquivo corrompido ou muito pequeno.');
        }

        const ext = path.extname(originalFileName).toLowerCase() || '.pf3';
        const base = path.basename(originalFileName, ext);
        const downloadName = `${base}_desbloqueado${ext}`;

        const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        const tempDir = path.join(os.tmpdir(), 'canon_unlocker');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        tempInPath = path.join(tempDir, `in_${uniqueId}${ext}`);
        tempOutPath = path.join(tempDir, `out_${uniqueId}${ext}`);

        fs.writeFileSync(tempInPath, fileBuffer);

        // Invoca o motor oficial do Canon Picture Style Editor para desbloqueio
        console.log(`[Unlock Engine] Processando com motor oficial...`);
        const cmd = `powershell -ExecutionPolicy Bypass -File "${ENGINE_PATH}" -InputPath "${tempInPath}" -OutputPath "${tempOutPath}"`;
        execSync(cmd, { stdio: 'pipe', encoding: 'utf-8', timeout: 30000 });

        if (!fs.existsSync(tempOutPath)) {
          throw new Error('Falha na geração do perfil desbloqueado.');
        }

        const unlockedBytes = fs.readFileSync(tempOutPath);
        console.log(`[Download] Perfil desbloqueado com sucesso! (${unlockedBytes.length} bytes)`);

        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${downloadName}"`
        });
        res.end(unlockedBytes);
      } catch (err) {
        console.error('[Erro]', err.message || err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Erro ao desbloquear perfil' }));
      } finally {
        if (tempInPath && fs.existsSync(tempInPath)) {
          try { fs.unlinkSync(tempInPath); } catch (_) {}
        }
        if (tempOutPath && fs.existsSync(tempOutPath)) {
          try { fs.unlinkSync(tempOutPath); } catch (_) {}
        }
      }
    });
    return;
  }

  // Static File Server
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(ROOT, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Canon Picture Style Unlocker - Servidor Local Pronto  `);
  console.log(`  Acesse no navegador: http://localhost:${PORT}        `);
  console.log(`=======================================================`);
});
