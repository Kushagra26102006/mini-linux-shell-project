class VFS {
    constructor() {
        this.root = {
            name: "/",
            type: "dir",
            children: {
                "home": {
                    name: "home",
                    type: "dir",
                    children: {
                        "user": {
                            name: "user",
                            type: "dir",
                            children: {
                                "welcome.txt": {
                                    name: "welcome.txt",
                                    type: "file",
                                    content: "Welcome to Mini Linux Shell!\nType 'ls' to see files, or 'help' for commands."
                                }
                            }
                        }
                    }
                },
                "bin": {
                    name: "bin",
                    type: "dir",
                    children: {}
                }
            }
        };
        this.currentPath = ["home", "user"];
        this.storagePath = "./vfs_storage.json";
        this.history = [];
        this.env = {
            "USER": "user",
            "HOME": "/home/user",
            "PATH": "/bin",
            "SHELL": "/bin/sh",
            "TERM": "xterm-256color"
        };
        this.aliases = {
            "ll": "ls -l",
            "la": "ls -a"
        };
        this.load();
    }

    addToHistory(cmd) {
        this.history.push({ cmd, timestamp: Date.now() });
    }

    getHistory() {
        return this.history;
    }

    save() {
        const fs = require('fs');
        try {
            fs.writeFileSync(this.storagePath, JSON.stringify(this.root, null, 2));
        } catch (err) {
            console.error("Failed to save VFS:", err);
        }
    }

    load() {
        const fs = require('fs');
        try {
            if (fs.existsSync(this.storagePath)) {
                this.root = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
            }
        } catch (err) {
            console.error("Failed to load VFS:", err);
        }
    }

    getCurrentDir() {
        let current = this.root;
        for (const dir of this.currentPath) {
            current = current.children[dir];
        }
        return current;
    }

    getAbsolutePath() {
        return "/" + this.currentPath.join("/");
    }

    ls() {
        const current = this.getCurrentDir();
        return Object.values(current.children)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(item => item.type === 'dir' ? `${item.name}/` : item.name);
    }

    pwd() {
        return this.getAbsolutePath();
    }

    cd(targetPath) {
        if (!targetPath || targetPath === "~") {
            this.currentPath = ["home", "user"];
            return { success: true };
        }
        if (targetPath === "/") {
            this.currentPath = [];
            return { success: true };
        }
        const parts = targetPath.split("/").filter(p => p !== "");
        let tempPath = targetPath.startsWith("/") ? [] : [...this.currentPath];
        for (const part of parts) {
            if (part === "..") {
                if (tempPath.length > 0) tempPath.pop();
            } else if (part === ".") {
                continue;
            } else {
                let current = this.root;
                for (const p of tempPath) {
                    current = current.children[p];
                }
                if (current.children[part] && current.children[part].type === "dir") {
                    tempPath.push(part);
                } else {
                    return { success: false, error: `cd: no such file or directory: ${targetPath}` };
                }
            }
        }
        this.currentPath = tempPath;
        return { success: true };
    }

    mkdir(name) {
        if (!name) return { success: false, error: "mkdir: missing operand" };
        const current = this.getCurrentDir();
        if (current.children[name]) return { success: false, error: `mkdir: cannot create directory '${name}': File exists` };
        current.children[name] = { name, type: "dir", children: {} };
        this.save();
        return { success: true };
    }

    touch(name) {
        if (!name) return { success: false, error: "touch: missing operand" };
        const current = this.getCurrentDir();
        if (current.children[name]) return { success: true };
        current.children[name] = { name, type: "file", content: "" };
        this.save();
        return { success: true };
    }

    cat(name) {
        if (!name) return { success: false, error: "cat: missing operand" };
        const current = this.getCurrentDir();
        const file = current.children[name];
        if (!file) return { success: false, error: `cat: ${name}: No such file or directory` };
        if (file.type === "dir") return { success: false, error: `cat: ${name}: Is a directory` };
        return { success: true, content: file.content };
    }

    echo(content, filename) {
        if (!filename) return { success: true, content: content };
        const current = this.getCurrentDir();
        current.children[filename] = { name: filename, type: "file", content };
        this.save();
        return { success: true };
    }

    saveFile(filename, content) {
        const current = this.getCurrentDir();
        current.children[filename] = { name: filename, type: "file", content };
        this.save();
        return { success: true };
    }

    rm(name) {
        if (!name) return { success: false, error: "rm: missing operand" };
        const current = this.getCurrentDir();
        if (!current.children[name]) return { success: false, error: `rm: cannot remove '${name}': No such file or directory` };
        if (current.children[name].type === "dir") return { success: false, error: `rm: cannot remove '${name}': Is a directory` };
        delete current.children[name];
        this.save();
        return { success: true };
    }

    rmdir(name) {
        if (!name) return { success: false, error: "rmdir: missing operand" };
        const current = this.getCurrentDir();
        if (!current.children[name]) return { success: false, error: `rmdir: failed to remove '${name}': No such file or directory` };
        if (current.children[name].type !== "dir") return { success: false, error: `rmdir: failed to remove '${name}': Not a directory` };
        if (Object.keys(current.children[name].children).length > 0) return { success: false, error: `rmdir: failed to remove '${name}': Directory not empty` };
        delete current.children[name];
        this.save();
        return { success: true };
    }

    autoComplete(partial) {
        const current = this.getCurrentDir();
        return Object.keys(current.children).filter(item => item.startsWith(partial));
    }

    getTree() {
        return this.root;
    }

    installPackage(pkgName) {
        if (!pkgName) return { success: false, error: "install: missing package name" };
        const bin = this.root.children["bin"];
        if (bin.children[pkgName]) return { success: false, error: `install: package '${pkgName}' is already installed` };
        
        // Simulate installation by adding a fake executable
        bin.children[pkgName] = { 
            name: pkgName, 
            type: "file", 
            content: `// Binary for ${pkgName}\nconsole.log("Running ${pkgName}...");` 
        };
        this.save();
        return { success: true };
    }

    addFileFromHost(name, content) {
        const current = this.getCurrentDir();
        current.children[name] = { name, type: "file", content };
        this.save();
        return { success: true };
    }

    cp(src, dest) {
        const current = this.getCurrentDir();
        const source = current.children[src];
        if (!source) return { success: false, error: `cp: cannot stat '${src}': No such file or directory` };
        if (source.type === 'dir') return { success: false, error: `cp: -r not specified; omitting directory '${src}'` };
        
        current.children[dest] = JSON.parse(JSON.stringify(source));
        current.children[dest].name = dest;
        this.save();
        return { success: true };
    }

    mv(src, dest) {
        const current = this.getCurrentDir();
        if (!current.children[src]) return { success: false, error: `mv: cannot stat '${src}': No such file or directory` };
        
        current.children[dest] = current.children[src];
        current.children[dest].name = dest;
        delete current.children[src];
        this.save();
        return { success: true };
    }

    grep(pattern, filename) {
        const res = this.cat(filename);
        if (!res.success) return res;
        const lines = res.content.split('\n');
        const matches = lines.filter(line => line.includes(pattern));
        return { success: true, content: matches.join('\n') };
    }
}
module.exports = VFS;
