import { createServer } from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import connectDB from './configs/db.js'
import deviceRouter from './routes/deviceRoutes.js'
import profileRouter from './routes/profileRoutes.js'
import sceneRouter from './routes/sceneRoutes.js'
import commandRouter from './routes/commandRoutes.js'
import libraryRouter from './routes/libraryRoutes.js'
import { initWebSocket } from './ws.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const seenMobileClients = new Set();

await connectDB();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    const client = req.get('X-HEMS-Client');
    if (client === 'mobile-app') {
        const remoteAddress = req.ip || req.socket?.remoteAddress || 'unknown';
        if (!seenMobileClients.has(remoteAddress)) {
            seenMobileClients.add(remoteAddress);
            console.log(`[APP CONNECT] client=${client} ip=${remoteAddress}`);
        }

        console.log(`[APP REQUEST] ${req.method} ${req.path}`);
    }
    next();
});

app.use('/audio', express.static(path.join(__dirname, 'public/audio')));
app.use('/podcast', express.static(path.join(__dirname, 'public/podcast')));
app.get('/', (req, res) => res.send("Server is running"));
app.use('/api/devices', deviceRouter)
app.use('/api/profiles', profileRouter)
app.use('/api/scenes', sceneRouter)
app.use('/api/commands', commandRouter)
app.use('/api/library', libraryRouter)

const PORT = process.env.PORT || 4000;
const server = createServer(app);
initWebSocket(server);
server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))
