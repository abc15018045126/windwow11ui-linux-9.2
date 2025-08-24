import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppDefinition, AppComponentProps } from '../../types';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const TerminusSshApp: React.FC<AppComponentProps> = ({ setTitle, instanceId }) => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [host, setHost] = useState('127.0.0.1');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<Terminal | null>(null);
    const fitAddon = useRef(new FitAddon());
    const sessionId = useRef<string | null>(null);

    useEffect(() => {
        setTitle(`Terminus SSH - ${status}`);
    }, [setTitle, status]);

    useEffect(() => {
        // In a real app, you might fetch the OS username from the main process
        setUsername('user');
    }, []);

    // Setup IPC listeners
    useEffect(() => {
        const handleSshData = (_event: any, data: string) => {
            term.current?.write(data);
        };
        const handleSshError = (_event: any, error: string) => {
            term.current?.write(`\r\n\x1b[31mError: ${error}\x1b[0m\r\n`);
            setErrorMsg(error);
            setStatus('error');
        };
        const handleSshClose = () => {
            if (status !== 'error') {
                term.current?.write('\r\n\x1b[33mConnection closed.\x1b[0m\r\n');
                setStatus('disconnected');
            }
            sessionId.current = null;
        };

        window.electronAPI.ssh.onData(instanceId, handleSshData);
        window.electronAPI.ssh.onError(instanceId, handleSshError);
        window.electronAPI.ssh.onClose(instanceId, handleSshClose);

        return () => {
            // Cleanup listeners when component unmounts
            window.electronAPI.ssh.offData(instanceId);
            window.electronAPI.ssh.offError(instanceId);
            window.electronAPI.ssh.offClose(instanceId);
            if (sessionId.current) {
                window.electronAPI.ssh.disconnect(sessionId.current);
            }
        };
    }, [instanceId, status]);


    // Initialize Terminal on connect
    useEffect(() => {
        if (status === 'connected' && terminalRef.current && !term.current) {
            const terminal = new Terminal({
                cursorBlink: true,
                theme: {
                    background: '#1e1e1e',
                    foreground: '#d4d4d4',
                    cursor: '#d4d4d4',
                    selectionBackground: '#264f78',
                },
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                fontSize: 14,
            });
            term.current = terminal;

            terminal.loadAddon(fitAddon.current);
            terminal.open(terminalRef.current);
            fitAddon.current.fit();
            terminal.focus();

            terminal.onData(data => {
                if (sessionId.current) {
                    window.electronAPI.ssh.sendData(sessionId.current, data);
                }
            });

            const resizeObserver = new ResizeObserver(() => {
                try {
                    fitAddon.current.fit();
                    const dims = fitAddon.current.proposeDimensions();
                    if (sessionId.current && dims) {
                        window.electronAPI.ssh.resize(sessionId.current, { cols: dims.cols, rows: dims.rows });
                    }
                } catch (e) { /* ignore */ }
            });
            if (terminalRef.current) {
                resizeObserver.observe(terminalRef.current);
            }

            return () => {
                resizeObserver.disconnect();
                terminal.dispose();
                term.current = null;
            };
        }
    }, [status]);

    const handleConnect = async () => {
        if (!host || !username) { // Password can be empty for key-based auth
            setErrorMsg('Host and username are required.');
            return;
        }

        setStatus('connecting');
        setErrorMsg('');
        term.current?.reset();

        const result = await window.electronAPI.ssh.connect(instanceId, { host, username, password });

        if (result.success) {
            sessionId.current = result.sessionId;
            setStatus('connected');
            setPassword('');
        } else {
            setErrorMsg(result.error);
            setStatus('error');
        }
    };

    const handleDisconnect = () => {
        if (sessionId.current) {
            window.electronAPI.ssh.disconnect(sessionId.current);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-zinc-200 font-mono text-sm">
            {status !== 'connected' ? (
                <div className="flex-grow flex items-center justify-center p-8">
                    <div className="w-full max-w-sm bg-zinc-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold text-center mb-4">New SSH Connection</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Host</label>
                                <input type="text" value={host} onChange={e => setHost(e.target.value)} className="w-full bg-zinc-900 p-2 rounded border border-zinc-700 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Username</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-zinc-900 p-2 rounded border border-zinc-700 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleConnect()} className="w-full bg-zinc-900 p-2 rounded border border-zinc-700 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                        {errorMsg && <p className="text-red-400 text-xs mt-4 text-center">{errorMsg}</p>}
                        <button onClick={handleConnect} disabled={status === 'connecting'} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 p-2 rounded font-semibold transition-colors">
                            {status === 'connecting' ? 'Connecting...' : 'Connect'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col overflow-hidden relative">
                    <div ref={terminalRef} className="w-full h-full p-2" />
                    <button onClick={handleDisconnect} className="absolute bottom-2 right-2 text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded z-10">
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
};

export const appDefinition: AppDefinition = {
    id: 'terminusSsh',
    name: 'Terminus SSH',
    icon: 'terminusSsh',
    component: TerminusSshApp,
    defaultSize: { width: 800, height: 500 },
    isPinned: false,
};

export default TerminusSshApp;
