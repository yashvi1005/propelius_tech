import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import authRoutes from './routes/auth';
import playlistRoutes from './routes/playlists';
import songRoutes from './routes/songs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api', songRoutes);


const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || '';
    await mongoose.connect(mongoURI);

  } catch (error) {
    console.log('MongoDB connection error:', error);
    process.exit(1);
  }
};



const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
  });
};

startServer(); 