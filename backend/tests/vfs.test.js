const VFS = require('../vfs');
const fs = require('fs');

// Mock fs to avoid writing to disk during tests
jest.mock('fs');

describe('VFS Class', () => {
    let vfs;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Initialize a fresh VFS for each test
        vfs = new VFS();
    });

    test('should initialize with correct root structure', () => {
        expect(vfs.pwd()).toBe('/home/user');
        expect(vfs.ls()).toContain('welcome.txt');
    });

    test('ls should list directories with /', () => {
        vfs.cd('/');
        const files = vfs.ls();
        expect(files).toContain('home/');
        expect(files).toContain('bin/');
    });

    test('cd should change directory', () => {
        vfs.cd('/');
        expect(vfs.pwd()).toBe('/');
        vfs.cd('home');
        expect(vfs.pwd()).toBe('/home');
        vfs.cd('user');
        expect(vfs.pwd()).toBe('/home/user');
    });

    test('cd .. should go up', () => {
        vfs.cd('..');
        expect(vfs.pwd()).toBe('/home');
        vfs.cd('..');
        expect(vfs.pwd()).toBe('/');
        vfs.cd('..'); // Already at root
        expect(vfs.pwd()).toBe('/');
    });

    test('cd should handle absolute paths', () => {
        vfs.cd('/bin');
        expect(vfs.pwd()).toBe('/bin');
    });

    test('mkdir should create a directory', () => {
        const res = vfs.mkdir('testdir');
        expect(res.success).toBe(true);
        expect(vfs.ls()).toContain('testdir/');
    });

    test('mkdir should fail if directory exists', () => {
        vfs.mkdir('testdir');
        const res = vfs.mkdir('testdir');
        expect(res.success).toBe(false);
        expect(res.error).toContain('File exists');
    });

    test('touch should create a file', () => {
        const res = vfs.touch('newfile.txt');
        expect(res.success).toBe(true);
        expect(vfs.ls()).toContain('newfile.txt');
    });

    test('cat should read file content', () => {
        const res = vfs.cat('welcome.txt');
        expect(res.success).toBe(true);
        expect(res.content).toContain('Welcome to Mini Linux Shell');
    });

    test('cat should fail for non-existent file', () => {
        const res = vfs.cat('ghost.txt');
        expect(res.success).toBe(false);
        expect(res.error).toContain('No such file');
    });

    test('rm should delete a file', () => {
        vfs.touch('temp.txt');
        expect(vfs.ls()).toContain('temp.txt');
        const res = vfs.rm('temp.txt');
        expect(res.success).toBe(true);
        expect(vfs.ls()).not.toContain('temp.txt');
    });

    test('rmdir should delete an empty directory', () => {
        vfs.mkdir('emptydir');
        const res = vfs.rmdir('emptydir');
        expect(res.success).toBe(true);
        expect(vfs.ls()).not.toContain('emptydir/');
    });

    test('rmdir should fail if directory is not empty', () => {
        vfs.mkdir('notempty');
        vfs.cd('notempty');
        vfs.touch('file.txt');
        vfs.cd('..');
        const res = vfs.rmdir('notempty');
        expect(res.success).toBe(false);
        expect(res.error).toContain('Directory not empty');
    });

    test('echo should write to file', () => {
        vfs.echo('hello world', 'hello.txt');
        const res = vfs.cat('hello.txt');
        expect(res.content).toBe('hello world');
    });

    test('autoComplete should suggest completions', () => {
        const suggestions = vfs.autoComplete('wel');
        expect(suggestions).toContain('welcome.txt');
    });
});
