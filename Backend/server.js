import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js'
import deviceRouter from './routes/deviceRoutes.js'
import profileRouter from './routes/profileRoutes.js'
import sceneRouter from './routes/sceneRoutes.js'
import commandRouter from './routes/commandRoutes.js'
import { initWebSocket } from './ws.js'

const app = express();

await connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send("Server is running"));
app.use('/api/devices', deviceRouter)
app.use('/api/profiles', profileRouter)
app.use('/api/scenes', sceneRouter)
app.use('/api/commands', commandRouter)

const PORT = process.env.PORT || 4000;
const server = createServer(app);
initWebSocket(server);
server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))
