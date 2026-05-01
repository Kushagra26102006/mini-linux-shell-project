const { server } = require('../server');
const Client = require('socket.io-client');
const fs = require('fs');

// Mock fs
jest.mock('fs');

describe('WebSocket Server', () => {
    let clientSocket;
    let port;

    beforeAll((done) => {
        server.listen(() => {
            port = server.address().port;
            clientSocket = new Client(`http://localhost:${port}`);
            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        server.close();
        clientSocket.close();
    });

    test('should receive output for a command', (done) => {
        clientSocket.emit('command', { command: 'ls', args: [] });
        clientSocket.on('output', (data) => {
            expect(data).toHaveProperty('output');
            expect(data.output).toContain('welcome.txt');
            clientSocket.off('output');
            done();
        });
    });

    test('should handle autoComplete request', (done) => {
        clientSocket.emit('autoComplete', { partial: 'wel' });
        clientSocket.on('autoCompleteResponse', (data) => {
            expect(data.matches).toContain('welcome.txt');
            clientSocket.off('autoCompleteResponse');
            done();
        });
    });

    test('should provide vfsTree on getTree', (done) => {
        clientSocket.emit('getTree');
        clientSocket.on('vfsTree', (tree) => {
            expect(tree).toHaveProperty('name', '/');
            expect(tree.children).toHaveProperty('home');
            clientSocket.off('vfsTree');
            done();
        });
    });
});
