import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js'
import deviceRouter from './routes/deviceRoutes.js'
import profileRouter from './routes/profileRoutes.js'
import sceneRouter from './routes/sceneRoutes.js'
import commandRouter from './routes/commandRoutes.js'

const app = express();

await connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send("Server is running"));
app.use('/api/device', deviceRouter)
app.use('/api/profile', profileRouter)
app.use('/api/scene', sceneRouter)
app.use('/api/command', commandRouter)


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))
