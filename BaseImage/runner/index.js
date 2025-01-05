const http = require('http')
const express = require('express')
const fs = require('fs/promises')
const { Server: SocketServer } = require('socket.io')
const path = require('path')
const cors = require('cors')
const chokidar = require('chokidar');
const os = require('os')
const pty = require('node-pty')
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'sh';
//file location in the container
const initialCwd = '../../app';
const ptyProcess = pty.spawn('sh', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: initialCwd,
    env: process.env
});

const app = express()
const server = http.createServer(app);
const io = new SocketServer({
    cors: {
        origin: "*" // Replace with your frontend URL
    },
});

app.use(cors());
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

io.attach(server);

chokidar.watch(`${initialCwd}`).on('all', (event, path) => {
    io.to('editor').emit('file:refresh', path)
});

const activeFiles = new Map();
const activeFileEditors = new Map();

io.on('connection', (socket) => {
    console.log(`Socket connected`, socket.id);

    if(io.engine.clientsCount > 10){
        console.log('Connection Limit Reached');
        socket.emit('error:connectionLimitReached', { message: 'Connection Limit Reached' });
        socket.disconnect();
        return;
    }

    socket.join('editor');

    socket.on('file:select', (path) => {
        if(activeFiles.has(socket.id)){
            console.log('inside delete for active fike',activeFiles.get(socket.id));
            activeFileEditors.get(activeFiles.get(socket.id)).delete(socket.id);
            if(activeFileEditors.get(activeFiles.get(socket.id)).size === 0){
                activeFileEditors.delete(activeFiles.get(socket.id))
            }
        }
        activeFiles.set(socket.id, path);

        if(!activeFileEditors.has(path)){
            activeFileEditors.set(path, new Set());
        }
        activeFileEditors.get(path).add(socket.id);
        console.log('Activer File Editors',activeFileEditors)
        console.log('Active Files',activeFiles)
        console.log(`Socket ${socket.id} is editing file: ${path}`);
    });

    

    socket.on('file:change', async ({ path, content }) => {
        await fs.writeFile(`${initialCwd}/${path}`, content);
        socket.broadcast.to('editor').emit('file:update', { path, content });
    })

    socket.on('terminal:write', (data) => {
        console.log("recieved",data)
        ptyProcess.write(data);
    })

    socket.on('oneTime', (data) => {
        ptyProcess.write('\r');
    })

    socket.on('cursor:move', ({ path, position }) => {
        if (activeFileEditors.has(path)) {
          activeFileEditors.get(path).forEach((id) => {
            if (id !== socket.id) {
              io.to(id).emit('cursor:update', { 
                path, 
                position: {
                  lineNumber: position.lineNumber,
                  column: position.column
                }, 
                userId: socket.id 
              });
            }
          });
        }
      });
    
    
    
    socket.to('editor').emit('file:refresh')
    socket.on('disconnect', () => {
        console.log(`A user disconnected ${socket.id}`);
        const path = activeFiles.get(socket.id);
        if(activeFileEditors.has(path)){
            activeFileEditors.get(path).delete(socket.id);
            if(activeFileEditors.get(path).size === 0){
                activeFileEditors.delete(path);
            }
        }
        activeFiles.delete(socket.id);
    });
})

ptyProcess.onData((data) => {
    io.to('editor').emit('terminal:data', data);
});

app.get('/files', async (req, res) => {
    const fileTree = await generateFileTree(`${initialCwd}`);
    return res.json({ tree: fileTree })
})
app.get('/files/content', async (req, res) => {
    const path = req.query.path;
    const content = await fs.readFile(`${initialCwd}/${path}`, 'utf-8')
    return res.json({ content })
})
server.listen(1000, () => console.log(`🐳 Docker server running on port 9000`))


async function generateFileTree(directory) {
    const tree = {}
    async function buildTree(currentDir, currentTree) {
        const files = await fs.readdir(currentDir);
        
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            
            // Skip the contents of the `node_modules` folder, but include the folder itself as empty
            if (file === 'node_modules') {
                currentTree[file] = {}; // Represent node_modules as an empty object
                continue;
            }
    
            try {
                const stat = await fs.stat(filePath);
    
                if (stat.isDirectory()) {
                    currentTree[file] = {};
                    await buildTree(filePath, currentTree[file]);
                } else {
                    currentTree[file] = null;
                }
            } catch (error) {
                // Log a warning for files that don't exist or have access issues, then skip them
                console.warn(`Warning: Could not access file ${filePath} - ${error.message}`);
                continue;
            }
        }
    }
    await buildTree(directory, tree);
    return tree
}