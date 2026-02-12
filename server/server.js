import express from 'express';
import 'dotenv/config';

const app = express();

app.get('/', (req, res) => res.send('Server is running'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));