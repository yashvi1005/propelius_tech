import mongoose from 'mongoose';

const songSchema =new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    required: true,
    trim: true
  },
  albumArt: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Song', songSchema); 