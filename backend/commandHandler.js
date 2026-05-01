/**
 * Command Handler Module
 * Manages the execution logic for various shell commands using the VFS.
 */

const handlers = {
    'ls': (vfs) => ({ output: vfs.ls().join('  ') }),
    'pwd': (vfs) => ({ output: vfs.pwd() }),
    'cd': (vfs, args) => {
        const res = vfs.cd(args[0]);
        return { error: res.success ? '' : res.error, path: vfs.pwd() };
    },
    'mkdir': (vfs, args) => {
        const res = vfs.mkdir(args[0]);
        return { error: res.success ? '' : res.error };
    },
    'touch': (vfs, args) => {
        const res = vfs.touch(args[0]);
        return { error: res.success ? '' : res.error };
    },
    'rm': (vfs, args) => {
        const res = vfs.rm(args[0]);
        return { error: res.success ? '' : res.error };
    },
    'rmdir': (vfs, args) => {
        const res = vfs.rmdir(args[0]);
        return { error: res.success ? '' : res.error };
    },
    'cat': (vfs, args) => {
        const res = vfs.cat(args[0]);
        return res.success ? { output: res.content } : { error: res.error };
    },
    'echo': (vfs, args) => {
        const input = args.join(' ');
        const idx = input.indexOf('>');
        if (idx !== -1) {
            const content = input.substring(0, idx).trim().replace(/^["']|["']$/g, '');
            const filename = input.substring(idx + 1).trim();
            vfs.echo(content, filename);
            return { output: '' };
        }
        return { output: input.replace(/^["']|["']$/g, '') };
    },
    'cp': (vfs, args) => {
        const res = vfs.cp(args[0], args[1]);
        return { error: res.success ? '' : res.error };
    },
    'mv': (vfs, args) => {
        const res = vfs.mv(args[0], args[1]);
        return { error: res.success ? '' : res.error };
    },
    'grep': (vfs, args) => {
        const res = vfs.grep(args[0], args[1]);
        return res.success ? { output: res.content } : { error: res.error };
    },
    'whoami': (vfs) => ({ output: vfs.env.USER }),
    'hostname': () => ({ output: 'minishell-v4' }),
    'date': () => ({ output: new Date().toString() }),
    'uptime': () => ({ output: `up 12 hours, 34 minutes, load average: 0.08, 0.03, 0.01` }),
    'uname': () => ({ output: 'MiniLinux 4.0.0-generic x86_64 GNU/Linux' }),
    'history': (vfs) => ({ output: vfs.getHistory().map((h, i) => `${i + 1}  ${h.cmd}`).join('\n') }),
    'env': (vfs) => ({ output: Object.entries(vfs.env).map(([k, v]) => `${k}=${v}`).join('\n') }),
    'export': (vfs, args) => {
        if (!args[0]) return { output: '' };
        const [key, val] = args[0].split('=');
        vfs.env[key] = val || '';
        return { output: '' };
    },
    'alias': (vfs, args) => {
        if (!args[0]) return { output: Object.entries(vfs.aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n') };
        const [key, val] = args.join(' ').split('=');
        if (key && val) vfs.aliases[key.trim()] = val.trim().replace(/^['"]|['"]$/g, '');
        return { output: '' };
    },
    'clear': () => ({ clear: true }),
    'help': () => ({ output: `Available commands: ${Object.keys(handlers).join(', ')}` }),
    'who': () => ({ output: 'user     tty1         2024-05-01 10:00' }),
    'ps': () => ({ output: '  PID TTY          TIME CMD\n    1 tty1     00:00:01 init\n   42 tty1     00:00:00 sh\n   89 tty1     00:00:00 ps' }),
    'free': () => ({ output: '              total        used        free      shared  buff/cache   available\nMem:        16384232     4123456    12260776      123456      456789    11804000\nSwap:        2097148           0     2097148' }),
    'df': () => ({ output: 'Filesystem     1K-blocks      Used Available Use% Mounted on\n/dev/sda1      102400000  45678900  56721100  45% /' }),
    'du': (vfs, args) => ({ output: `4.0K\t${args[0] || '.'}` }),
    'head': (vfs, args) => {
        const res = vfs.cat(args[0]);
        if (!res.success) return { error: res.error };
        return { output: res.content.split('\n').slice(0, 10).join('\n') };
    },
    'tail': (vfs, args) => {
        const res = vfs.cat(args[0]);
        if (!res.success) return { error: res.error };
        return { output: res.content.split('\n').slice(-10).join('\n') };
    },
    'wc': (vfs, args) => {
        const res = vfs.cat(args[0]);
        if (!res.success) return { error: res.error };
        const lines = res.content.split('\n').length;
        const words = res.content.split(/\s+/).filter(Boolean).length;
        const chars = res.content.length;
        return { output: `${lines} ${words} ${chars} ${args[0]}` };
    },
    'ping': (vfs, args) => ({ output: `PING ${args[0] || 'localhost'} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.038 ms` }),
    'curl': (vfs, args) => ({ output: `Fetching ${args[0]}...\n<HTML><BODY>MiniShell Simulated Response for ${args[0]}</BODY></HTML>` }),
    'wget': (vfs, args) => ({ output: `--2024-05-01 20:10:00--  ${args[0]}\nResolving ${args[0]}... 127.0.0.1\nConnecting to ${args[0]}... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1024 (1K)\nSaving to: '${args[0].split('/').pop() || 'index.html'}'` }),
    'ssh': (vfs, args) => ({ output: `ssh: connect to host ${args[0]} port 22: Connection refused` }),
    'nslookup': (vfs, args) => ({ output: `Server:\t\t127.0.0.53\nAddress:\t127.0.0.53#53\n\nNon-authoritative answer:\nName:\t${args[0] || 'google.com'}\nAddress: 142.250.190.46` }),
    'fortune': () => {
        const quotes = [
            "A clean tie attracts a soup stain.",
            "If you can't be good, be careful.",
            "You will be hungry again in one hour.",
            "Your behavior will be well-received by others."
        ];
        return { output: quotes[Math.floor(Math.random() * quotes.length)] };
    },
    'joke': () => {
        const jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs.",
            "There are 10 types of people: those who understand binary, and those who don't.",
            "Real programmers count from 0."
        ];
        return { output: jokes[Math.floor(Math.random() * jokes.length)] };
    },
    'cowsay': (vfs, args) => {
        const msg = args.join(' ') || 'Moo!';
        return { output: ` _____________________\n< ${msg} >\n ---------------------\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||` };
    },
    'neofetch': () => ({ output: `\x1b[32m       .---.       \x1b[0m  \x1b[1muser@minishell\x1b[0m\n\x1b[32m      /     \\      \x1b[0m  --------------\n\x1b[32m      | () () |     \x1b[0m  \x1b[34mOS\x1b[0m: Mini Linux 4.0\n\x1b[32m      \\  ^  /      \x1b[0m  \x1b[34mKernel\x1b[0m: 4.0.0-vfs\n\x1b[32m       |||||       \x1b[0m  \x1b[34mUptime\x1b[0m: 12h 34m\n\x1b[32m       '---'       \x1b[0m  \x1b[34mShell\x1b[0m: sh\n                     \x1b[34mCPU\x1b[0m: Virtual JS Core\n                     \x1b[34mMemory\x1b[0m: 4GB / 16GB` }),
    'weather': (vfs, args) => ({ output: `Weather for ${args[0] || 'Local'}: Sunny, 24°C, Humidity 45%` }),
    'sudo': () => ({ output: "Nice try, but you're already root!" }),
    'matrix': () => ({ output: "Waking up Neo...\nSearching for the White Rabbit...", matrix: true }),
    'exit': () => ({ output: "Session terminated. Please refresh the page to reconnect." }),
    'reboot': () => ({ output: "Rebooting system...", reboot: true }),
    'base64': (vfs, args) => {
        const content = args.slice(1).join(' ');
        if (args[0] === '-d') return { output: Buffer.from(content, 'base64').toString() };
        return { output: Buffer.from(content).toString('base64') };
    },
    'stat': (vfs, args) => ({ output: `  File: ${args[0]}\n  Size: 1024      Blocks: 8          IO Block: 4096   regular file\nDevice: 801h/2049d  Inode: 1234567     Links: 1\nAccess: (0644/-rw-r--r--)  Uid: ( 1000/    user)   Gid: ( 1000/    user)` }),
    'chmod': () => ({ output: '' }),
    'chown': () => ({ output: '' }),
    'sleep': (vfs, args) => ({ output: `Sleeping for ${args[0]} seconds... (Simulated)` }),
    'nano': (vfs, args) => {
        if (!args[0]) return { error: 'nano: missing filename' };
        const res = vfs.cat(args[0]);
        return { 
            nano: true, 
            filename: args[0], 
            content: res.success ? res.content : '' 
        };
    },
    'ai': (vfs, args) => {
        const query = args.join(' ');
        if (!query) return { output: "AI: How can I help you with your shell commands today?" };
        return { output: `AI: To accomplish "${query}", you might want to try using '${args[0] === 'list' ? 'ls' : 'help'}'. (Simulation Mode)` };
    },
    'install': (vfs, args) => {
        const res = vfs.installPackage(args[0]);
        return res.success ? { output: `Successfully installed ${args[0]}` } : { error: res.error };
    }
};

const executeCommand = (vfs, fullCommand) => {
    const trimmed = fullCommand.trim();
    if (!trimmed) return { output: '', error: '', path: vfs.pwd() };

    vfs.addToHistory(trimmed);

    const parts = trimmed.split(/\s+/);
    let command = parts[0];
    const args = parts.slice(1);

    // Check alias
    if (vfs.aliases[command]) {
        return executeCommand(vfs, vfs.aliases[command] + ' ' + args.join(' '));
    }

    const handler = handlers[command];
    if (handler) {
        try {
            const res = handler(vfs, args);
            return { output: '', error: '', path: vfs.pwd(), ...res };
        } catch (err) {
            return { output: '', error: `Internal Error: ${err.message}`, path: vfs.pwd() };
        }
    }

    return { output: '', error: `sh: command not found: ${command}`, path: vfs.pwd() };
};

module.exports = { executeCommand };
