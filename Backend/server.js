import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js'
import deviceRouter from './routes/deviceRoutes.js'

const app = express();

await connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send("Server is running"));
app.use('/api/device', deviceRouter)

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))
