import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './routes/disaster.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
app.set('io', io);


io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());  
app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.send('Hello disaster relief app!');
});

app.use('/api', router);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
