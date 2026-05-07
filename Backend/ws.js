import { WebSocketServer } from 'ws';

let wss = null;

export function initWebSocket(httpServer) {
    wss = new WebSocketServer({ server: httpServer });
    wss.on('connection', (ws) => {
        console.log('[WS] Unity client connected');
        ws.on('close', () => console.log('[WS] Unity client disconnected'));
    });
    console.log('[WS] WebSocket server ready');
}

export function broadcast(data) {
    if (!wss) return;
    const msg = JSON.stringify(data);
    for (const client of wss.clients) {
        if (client.readyState === 1) client.send(msg);
    }
}
