const { executeCommand } = require('../commandHandler');
const VFS = require('../vfs');

// Mock fs to avoid disk access
jest.mock('fs');

describe('Command Handler', () => {
    let vfs;

    beforeEach(() => {
        vfs = new VFS();
    });

    test('should execute ls', () => {
        const res = executeCommand(vfs, 'ls');
        expect(res.output).toContain('welcome.txt');
    });

    test('should execute pwd', () => {
        const res = executeCommand(vfs, 'pwd');
        expect(res.output).toBe('/home/user');
    });

    test('should execute mkdir and reflect change', () => {
        executeCommand(vfs, 'mkdir new_dir');
        const res = executeCommand(vfs, 'ls');
        expect(res.output).toContain('new_dir/');
    });

    test('should handle unknown commands', () => {
        const res = executeCommand(vfs, 'invalidcmd');
        expect(res.error).toBe('sh: command not found: invalidcmd');
    });

    test('should execute echo with redirection', () => {
        executeCommand(vfs, 'echo "test content" > test.txt');
        const res = executeCommand(vfs, 'cat test.txt');
        expect(res.output).toBe('test content');
    });

    test('should execute help', () => {
        const res = executeCommand(vfs, 'help');
        expect(res.output).toContain('Available commands');
    });

    test('should execute clear', () => {
        const res = executeCommand(vfs, 'clear');
        expect(res.clear).toBe(true);
    });

    test('should handle multiple spaces in command', () => {
        const res = executeCommand(vfs, '  ls   ');
        expect(res.output).toContain('welcome.txt');
    });

    test('should handle cd with error', () => {
        const res = executeCommand(vfs, 'cd non_existent_folder');
        expect(res.error).toContain('no such file or directory');
    });
});
