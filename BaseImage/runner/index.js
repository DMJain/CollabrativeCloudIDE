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
    })

    app.use(cors());
    app.use((req, res, next) => {
        console.log(`Incoming request: ${req.method} ${req.url}`);
        next();
      });

    io.attach(server);


    chokidar.watch(`${initialCwd}`).on('all', (event, path) => {
        io.emit('file:refresh', path)
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected`, socket.id)

        socket.on('file:change', async ({ path, content }) => {
            await fs.writeFile(`${initialCwd}/${path}`, content)
        })

        socket.on('terminal:write', (data) => {
            console.log("recieved",data)
            ptyProcess.write(data);
        })

        socket.on('oneTime', (data) => {
            ptyProcess.write('\r');
        })
        
        socket.emit('file:refresh')

        socket.on('disconnect', () => {
            console.log(`A user disconnected ${socket.id}`);
          });
    })

    function stripAnsi(data) {
        // Regular expression to match ANSI escape sequences
        const ansiRegex = /\x1b\[[0-9;]*m/g;
        return data.replace(ansiRegex, '');
    }
    
    ptyProcess.onData((data) => {
        const cleanData = stripAnsi(data).trim();
    
        const portMatch = cleanData.match(/http:\/\/localhost:(\d+)/);
        if (portMatch) {
            const vitePort = parseInt(portMatch[1], 10);
            console.log(`Detected Vite app port: ${vitePort}`);
            
        }
    
        console.log("Cleaned terminal data:", cleanData);
        io.emit('terminal:data', data);
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