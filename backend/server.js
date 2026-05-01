const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const VFS = require('./vfs');

const commandHandler = require('./commandHandler');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 5001;
const sessions = new Map();

io.on('connection', (socket) => {
    // Initialize session with a fresh VFS instance
    sessions.set(socket.id, new VFS());

    socket.on('command', async (data) => {
        const vfs = sessions.get(socket.id);
        if (!vfs) {
            socket.emit('output', { error: 'Session expired or lost.' });
            return;
        }

        const fullCommand = `${data.command} ${data.args ? data.args.join(' ') : ''}`;
        const response = commandHandler.executeCommand(vfs, fullCommand);
        
        // Removed processing delay for instant response

        // Stream lines without delay
        if (response.output && response.output.includes('\n')) {
            const lines = response.output.split('\n');
            for (const line of lines) {
                socket.emit('output', { ...response, output: line });
            }
        } else {
            socket.emit('output', response);
        }
        
        socket.emit('vfsTree', vfs.getTree());
    });

    socket.on('getTree', () => {
        const vfs = sessions.get(socket.id);
        if (vfs) socket.emit('vfsTree', vfs.getTree());
    });

    socket.on('autoComplete', (data) => {
        const vfs = sessions.get(socket.id);
        if (vfs) {
            socket.emit('autoCompleteResponse', { 
                matches: vfs.autoComplete(data.partial) 
            });
        }
    });

    socket.on('saveFile', (data) => {
        const vfs = sessions.get(socket.id);
        if (vfs) {
            vfs.saveFile(data.filename, data.content);
            socket.emit('output', { output: `Saved ${data.filename}` });
            socket.emit('vfsTree', vfs.getTree());
        }
    });

    socket.on('disconnect', () => {
        sessions.delete(socket.id);
    });
});
if (require.main === module) {
    server.listen(PORT, () => console.log(`Server on ${PORT}`));
}

module.exports = { app, server, io };
