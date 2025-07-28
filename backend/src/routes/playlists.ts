import express from 'express';
import { auth } from '../middleware/auth';
import Playlist from '../models/Playlist';
import User from '../models/User';

const router = express.Router();

router.get('/', auth, async (req: any, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.userId })
      .populate('songs')
      .sort({ createdAt: -1 });
    
    res.json(playlists);
  } catch (error) {
    console.log('Get playlists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req: any, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    }).populate('songs');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    res.json(playlist);
  } catch (error) {
    console.log('Get playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req: any, res) => {
  try {
    const { name, description } = req.body;
    const playlist = new Playlist({
      name,
      description: description || '',
      user: req.user.userId
    });
    
    await playlist.save();
    
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { playlists: playlist._id } }
    );
    res.status(201).json(playlist);
  } catch (error) {
    console.log('Create playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req: any, res) => {
  try {
    const { name, description } = req.body;
    
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { name, description: description || '' },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    res.json(playlist);
  } catch (error) {
    console.log('Update playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req: any, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { playlists: req.params.id } }
    );
    
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.log('Delete playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 