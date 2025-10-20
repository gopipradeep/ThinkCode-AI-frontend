// src/CollabSession.js

import React, { useState, useEffect, useRef } from 'react';
import {
    MonacoEditor,
    InlineTerminal,
    Notification,
    CopyIcon,
    ClearIcon,
    PlayIcon,
    StopIcon,
    CollaborationIcon,
    Logo,
    styles, // Base styles from ThinkCodeAI
    SunIcon, MoonIcon,
    LanguageSelector,
    languages
} from './ThinkCodeAI'; // Import shared components/styles from ThinkCodeAI

// Reused helper from ThinkCodeAI for consistency
const COLLAB_BASE_URL = window.location.origin;
// Ensure this WS_URL is correct for your environment
const WS_URL = `wss://redesigned-space-xylophone-q7r97969rrjc9r9q-8080.app.github.dev/execute-ws`;

// --- STYLES FOR THE FIXED CHAT SIDEBAR LAYOUT ---
const collabStyles = `
  /* Ensure the main container fills the height */
  .thinkcode-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0; /* Remove padding for edge-to-edge layout */
  }

  /* Make the header take only necessary height */
  .thinkcode-header {
    flex-shrink: 0;
    border-radius: 0;
    margin: 0;
    padding: 0.75rem 1.5rem; /* Restore padding inside header */
    border-bottom: 1px solid var(--border-color); /* Ensure header border */
  }

  /* Make the main area fill the remaining space and act as a flex container */
  .thinkcode-main {
    flex-grow: 1;
    display: flex; /* Key change: Main area arranges Editor/Terminal wrapper and Chat sidebar horizontally */
    min-height: 0; /* Prevent flex children from overflowing */
    gap: 0;
  }

  /* Wrapper for the resizable Editor/Terminal area */
  .editor-terminal-wrapper {
    display: flex; /* This wrapper also uses flex */
    flex-grow: 1; /* Takes up available space left by the chat */
    min-width: 0; /* Important for flex items */
    height: 100%; /* Fills the main area height */
    position: relative; /* Needed for resizer */
  }

  /* Fixed-width chat sidebar */
  .collab-chat-sidebar {
    width: 320px;       /* Fixed width */
    min-width: 320px;   /* Prevent shrinking below fixed width */
    height: 100%;       /* Full height */
    display: flex;      /* Use flex for internal chat layout */
    flex-direction: column;
    border-left: 1px solid var(--border-color);
    background-color: var(--bg-secondary); /* Match theme */
    flex-shrink: 0;     /* Prevent sidebar from shrinking */
  }

  /* Ensure panels inside the wrapper have no border/radius */
  .editor-terminal-wrapper .panel {
      border-radius: 0;
      border: none;
      box-shadow: none;
      height: 100%; /* Make panels fill wrapper height */
      display: flex; /* Ensure panels use flex internally */
      flex-direction: column;
  }
  .editor-terminal-wrapper .editor-panel {
      border-right: 1px solid var(--border-color); /* Separator line */
  }
  .resizer {
      background-color: var(--border-color); /* Make resizer more visible */
      width: 5px; /* Thinner resizer */
      flex-shrink: 0; /* Prevent resizer from shrinking */
      cursor: col-resize;
      /* Add hover effect directly here if needed */
      display: flex; /* For centering the pseudo-element */
      align-items: center;
      justify-content: center;
  }
  .resizer:hover::before {
     content: ''; /* Required for pseudo-elements */
     width: 5px;
     height: 30px;
     background-color: var(--accent-primary);
     border-radius: 0;
     display: block; /* Make it visible */
  }
  /* Ensure terminal content fills space */
   .output-panel .output-header {
       flex-shrink: 0;
   }
   .output-panel > div:last-child { /* Target the div holding InlineTerminal */
       flex-grow: 1;
       min-height: 0;
   }
`;


// --- Chat Components with Less Congestion ---

const ChatMessage = ({ sender, text, isCurrentUser }) => (
    // Styling with increased spacing
    <div style={{
        margin: '0.8rem 0', padding: '0.7rem 1.1rem', borderRadius: '12px',
        backgroundColor: isCurrentUser ? 'var(--accent-primary)' : 'var(--bg-primary)',
        color: isCurrentUser ? 'white' : 'var(--text-primary)',
        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%', wordBreak: 'break-word',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)', lineHeight: 1.45,
    }}>
        <strong style={{
            fontSize: '0.7rem', opacity: 0.9, display: 'block',
            marginBottom: '0.25rem', color: isCurrentUser ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'
         }}> {isCurrentUser ? 'You' : sender}: </strong>
        <p style={{ margin: '0', fontSize: '0.9rem' }}>{text}</p>
    </div>
);

const ChatSection = ({ messages, onSendMessage, user, isConnected }) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentMessage.trim() && isConnected) {
            onSendMessage(currentMessage.trim());
            setCurrentMessage('');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid var(--border-color)' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontWeight: 600, flexShrink: 0 }}>
                Live Chat {isConnected ? '🟢' : '🔴'}
            </div>
            <div style={{
                flexGrow: 1, padding: '0.5rem 1rem', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)'
            }}>
                {messages.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem', fontSize: '0.9rem'}}>{isConnected ? 'Start chatting!' : 'Connecting...'}</p>}
                {messages.map((msg, index) => ( <ChatMessage key={index} sender={msg.sender} text={msg.text} isCurrentUser={msg.senderId === user.uid} /> ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                <input
                    type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder={isConnected ? "Type a message..." : "Connecting..."} disabled={!isConnected}
                    aria-label="Chat message input"
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: `1px solid var(--border-color)`,
                        backgroundColor: 'var(--bg-primary)', // Input uses primary bg
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box' // <-- THE FIX
                    }}
                />
            </form>
        </div>
    );
};


// --- MAIN COLLABORATION COMPONENT ---

function CollabSession({ collabId, user, onLogout }) {
    // Code and Language states
    const [code, setCode] = useState('// Connecting...'); // Synced code from server
    const [language, setLanguage] = useState('python'); // Synced language from server
    const [tempCode, setTempCode] = useState('// Connecting...'); // Local editor buffer
    const [selectedLanguage, setSelectedLanguage] = useState('python'); // Local language choice

    // UI States
    const [theme, setTheme] = useState('dark');
    const [editorWidth, setEditorWidth] = useState(60); // Initial Editor width % *within the flexible area*
    const [isResizing, setIsResizing] = useState(false);

    // WebSocket States
    const ws = useRef(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [terminalOutput, setTerminalOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isWaitingForInput, setIsWaitingForInput] = useState(false);
    let reconnectTimeout = useRef(null);
    let healthCheckInterval = useRef(null);

    // Other States
    const [chatMessages, setChatMessages] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [notification, setNotification] = useState({ message: null, type: 'success' });
    const setNotificationMessage = (message, type = 'success') => setNotification({ message, type });
    const clearNotification = () => setNotification({ message: null, type: 'success' });

    // --- Connection and Sync Logic ---
    const connectWebSocket = () => {
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
        if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) return;

        console.log(`🔌 Attempting connection: ${WS_URL}`);
        setConnectionStatus('connecting');
        try {
            if (ws.current) ws.current.close(1000, 'Reconnecting');
            ws.current = new WebSocket(WS_URL);

            ws.current.onopen = () => {
                console.log('✅ WebSocket connected');
                setConnectionStatus('connected');
                const joinMessage = { type: 'join_collab_session', sessionId: collabId, userId: user.uid, displayName: user.displayName || user.email?.split('@')[0] || 'User' };
                ws.current.send(JSON.stringify(joinMessage));
                setNotificationMessage(`Joining session ${collabId.substring(0, 8)}...`, 'success');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    switch (message.type) {
                        case 'initial_code_sync': {
                            const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
                            setCode(data.code ?? '');
                            setTempCode(data.code ?? '');
                            setLanguage(data.language ?? 'python');
                            setSelectedLanguage(data.language ?? 'python');
                            setNotificationMessage('Session joined. Code synced.', 'success');
                            break;
                        }
                        case 'code_sync': { // Received when another user clicks "Apply Changes"
                            const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
                            setCode(data.code ?? code);
                            setLanguage(data.language ?? language);
                            setTempCode(data.code ?? code); // Update editor immediately
                            setSelectedLanguage(data.language ?? language); // Update local selection
                            setNotificationMessage('Code updated by collaborator.', 'success');
                            break;
                        }
                        case 'chat_message': {
                            const data = message.data;
                            setChatMessages(prev => [...prev, { sender: data.displayName || 'User', text: data.text || '', senderId: data.userId || '' }]);
                            break;
                        }
                        case 'collab_update': setNotificationMessage(message.data, 'success'); break;
                        case 'output': setTerminalOutput(prev => prev + (message.data || '')); break;
                        case 'input_request': setIsWaitingForInput(true); break;
                        case 'execution_started': setIsRunning(true); setTerminalOutput("Starting execution...\n"); break;
                        case 'execution_complete': setIsRunning(false); setIsWaitingForInput(false); setTerminalOutput(prev => prev + '\n' + (message.data || '') + '\n\nExecution finished.\n'); break;
                        case 'error': setTerminalOutput(prev => prev + '\n[System Error]: ' + (message.data || 'Unknown error') + '\n'); setIsRunning(false); setIsWaitingForInput(false); break;
                        case 'pong': break;
                        default: console.warn("Unknown message type:", message.type); break;
                    }
                } catch (error) { console.error('Error parsing message:', event.data, error); }
            };

            ws.current.onerror = (error) => console.error('❌ WebSocket error:', error);
            ws.current.onclose = (event) => {
                console.log('🔌 WebSocket closed:', event.code, event.reason);
                setConnectionStatus('disconnected'); setIsRunning(false); setIsWaitingForInput(false);
                if (event.code !== 1000 && event.code !== 1001 && !reconnectTimeout.current) {
                    setNotificationMessage('Connection lost. Reconnecting...', 'error');
                    reconnectTimeout.current = setTimeout(connectWebSocket, 5000);
                } else if (event.code === 1000) { setNotificationMessage("Disconnected.", 'success'); }
            };
        } catch (error) {
             console.error('❌ WebSocket creation failed:', error); setConnectionStatus('disconnected');
             if (!reconnectTimeout.current) reconnectTimeout.current = setTimeout(connectWebSocket, 5000);
        }
    };

    // --- WebSocket Setup Effect ---
    useEffect(() => {
        connectWebSocket();
        healthCheckInterval.current = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                try { ws.current.send(JSON.stringify({ type: 'ping' })); } catch { /* ignore */ }
            } else if (connectionStatus === 'disconnected' && !reconnectTimeout.current) { connectWebSocket(); }
        }, 30000);
        return () => { // Cleanup
            if (ws.current) ws.current.close(1000, 'Component unmounting');
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (healthCheckInterval.current) clearInterval(healthCheckInterval.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collabId, user.uid]);

    // --- Handlers (Manual Sync Logic) ---

    // Updates only local language selection.
    const handleLanguageChange = (newLanguage) => {
        if (isRunning) { setNotificationMessage("Cannot change language while running.", 'error'); return; }
        setSelectedLanguage(newLanguage);
        if (newLanguage !== language) {
             const langLabel = languages.find(l => l.value === newLanguage)?.label || newLanguage;
             setNotificationMessage(`Language set to ${langLabel}. Click Apply Changes to sync.`, 'info');
        }
    };

    // Executes using local states
    const runCode = () => {
        if (isRunning || connectionStatus !== 'connected') return;
        const message = { type: 'execute', language: selectedLanguage, code: tempCode };
        try { ws.current.send(JSON.stringify(message)); } catch (error) { setTerminalOutput(prev => prev + `\nFailed to send code: ${error.message}\n`); setIsRunning(false); }
    };

    const stopExecution = () => {
        if (ws.current?.readyState === WebSocket.OPEN) { ws.current.send(JSON.stringify({ type: 'stop' })); }
    };

    // Sends both local code AND local language choice on click.
    const applyChanges = () => {
        if (connectionStatus !== 'connected') { setNotificationMessage("Cannot apply: Disconnected.", 'error'); return; }
        if (tempCode === code && selectedLanguage === language) { setNotificationMessage("No changes to apply.", 'success'); return; }
        const syncMessage = { type: 'sync_code', sessionId: collabId, code: tempCode, language: selectedLanguage, userId: user.uid };
        try {
            ws.current.send(JSON.stringify(syncMessage));
            setCode(tempCode); // Update local synced state
            setLanguage(selectedLanguage);
            setNotificationMessage("Changes synced!", 'success');
        } catch (error) { setNotificationMessage("Failed to sync changes.", 'error'); }
    };

    const handleSendMessage = (text) => {
        if (!text || connectionStatus !== 'connected') return;
        const chatMessage = { type: 'chat_message', sessionId: collabId, data: { text, userId: user.uid, displayName: user.displayName || user.email?.split('@')[0] || 'User' }};
        try { ws.current.send(JSON.stringify(chatMessage)); } catch (error) { console.error("Chat send error:", error); }
    };

    const handleInlineInput = (inputText) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !isRunning) return;
        const message = { type: 'input', data: inputText };
        setTerminalOutput(prev => prev + inputText + '\n'); // Echo locally
        try { ws.current.send(JSON.stringify(message)); } catch (error) { console.error("Input send error:", error); }
        setIsWaitingForInput(false);
    };

    const handleHome = () => { window.location.href = '/'; };

    // --- Layout and UI Handlers ---
    const handleMouseDown = (e) => setIsResizing(true);
    const handleMouseUp = () => setIsResizing(false);
    // Adjusted mouse move for the wrapper between Editor and Terminal
    const handleMouseMove = (e) => {
        if (!isResizing) return;
        const container = e.currentTarget; // editor-terminal-wrapper
        if (!container) return;
        const totalWidth = container.offsetWidth;
        const newEditorWidth = ((e.clientX - container.getBoundingClientRect().left) / totalWidth) * 100;
        // Constraints for Editor vs Terminal split (e.g., Editor 15-85%)
        if (newEditorWidth > 15 && newEditorWidth < 85) {
            setEditorWidth(newEditorWidth);
        }
    };

    // Global mouse listeners
    useEffect(() => { window.addEventListener('mouseup', handleMouseUp); return () => window.removeEventListener('mouseup', handleMouseUp); }, []);
    useEffect(() => {
        const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown]);

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    // Check if EITHER local code OR local language selection differs
    const hasUnsyncedChanges = tempCode !== code || selectedLanguage !== language;
    const isBusy = isRunning;
    const getMonacoLanguage = (lang) => languages.find(l => l.value === lang)?.monacoLang || lang;

    // --- Render ---
    return (
        <>
            <style>{styles}</style> {/* Base styles */}
            <style>{collabStyles}</style> {/* Styles for fixed chat sidebar */}
            <div className={`thinkcode-container theme-${theme}`}>
                <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
                <header className="thinkcode-header">
                    <div className="thinkcode-logo">
                        <Logo />
                        <h1>Collab: {collabId?.substring(0, 8) ?? '...'}</h1>
                        <CollaborationIcon style={{width: '1.5rem', height: '1.5rem', color: 'var(--accent-secondary)'}} />
                    </div>
                    <div className="thinkcode-controls">
                        <LanguageSelector
                            language={selectedLanguage}
                            setLanguage={handleLanguageChange}
                            languages={languages}
                            isDisabled={isBusy || connectionStatus !== 'connected'}
                        />
                        {!isBusy ? ( <button onClick={runCode} className="styled-button" disabled={connectionStatus !== 'connected'}><PlayIcon /> <span>Run ({selectedLanguage})</span></button> )
                                 : ( <button onClick={stopExecution} className="styled-button stop-button"><StopIcon /> <span>Stop</span></button> )}
                        <button
                            onClick={applyChanges} className="styled-button"
                            disabled={!hasUnsyncedChanges || connectionStatus !== 'connected'}
                            title={hasUnsyncedChanges ? "Sync your code/language changes" : "Code & Language are synced"}
                            style={{
                                background: hasUnsyncedChanges ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-tertiary)',
                                boxShadow: hasUnsyncedChanges ? '0 4px 15px -2px rgba(16, 185, 129, 0.3)' : 'none'
                            }} >
                           <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.4" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                           <span>Apply Changes ({hasUnsyncedChanges ? '*' : 'Synced'})</span>
                        </button>
                        <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}> {theme === 'dark' ? <SunIcon /> : <MoonIcon />} </button>
                        <div className="account-dropdown-container" ref={dropdownRef}>
                           <div className="account-icon" onClick={toggleDropdown} title="Account Options">
                                {user?.photoURL ? <img src={user.photoURL} alt="Profile" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : null}
                                <span style={{display: user?.photoURL ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1}}>{user?.email?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                           </div>
                           <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
                                <div className="dropdown-header">{user?.email || user?.displayName || 'User'}</div>
                                <button className="dropdown-item" onClick={handleHome}><svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Go to Home</button>
                                <button className="dropdown-item" onClick={() => { onLogout(); setShowDropdown(false); }}><svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>Logout</button>
                           </div>
                        </div>
                    </div>
                </header>

                {/* Main content area */}
                <main className="thinkcode-main">
                    {/* Resizable Editor/Terminal Area */}
                    <div
                        className="editor-terminal-wrapper"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseUp} // Stop resize if mouse leaves wrapper
                    >
                        {/* Editor Panel */}
                        <div className="panel editor-panel" style={{ width: `${editorWidth}%` }}>
                             <MonacoEditor
                                language={getMonacoLanguage(selectedLanguage)} // Highlighting follows local
                                theme={theme}
                                value={tempCode} // Editor shows local buffer
                                onChange={(v) => setTempCode(v ?? "")}
                            />
                        </div>

                        {/* Resizer BETWEEN Editor and Terminal */}
                        <div
                            className="resizer"
                            onMouseDown={handleMouseDown}
                            title="Resize panels"
                        ></div>

                        {/* Terminal Panel (takes remaining space in wrapper) */}
                        <div className="panel output-panel" style={{ width: `${100 - editorWidth}%` }}>
                             <div className="output-header">
                                <div style={{padding: '0 1rem', fontWeight: '500'}}>Terminal</div>
                                <div className="output-controls">
                                    <button onClick={() => navigator.clipboard.writeText(terminalOutput)} title="Copy"><CopyIcon/></button>
                                    <button onClick={() => setTerminalOutput("")} title="Clear"><ClearIcon/></button>
                                </div>
                            </div>
                            {/* Wrapper div needed for flex-grow */}
                            <div style={{flexGrow: 1, minHeight: 0}}>
                                <InlineTerminal
                                    output={terminalOutput}
                                    isWaitingForInput={isWaitingForInput && connectionStatus === 'connected'}
                                    onSendInput={handleInlineInput}
                                />
                            </div>
                        </div>
                    </div> {/* End editor-terminal-wrapper */}

                    {/* Fixed Chat Sidebar */}
                    <div className="collab-chat-sidebar">
                        <ChatSection
                            messages={chatMessages}
                            onSendMessage={handleSendMessage}
                            user={user}
                            isConnected={connectionStatus === 'connected'}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}

export default CollabSession;