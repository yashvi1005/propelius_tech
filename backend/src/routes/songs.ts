import express from 'express';
import { auth } from '../middleware/auth';
import Playlist from '../models/Playlist';
import Song from '../models/Song';
import { searchTracks } from '../services/spotify';

const router = express.Router();

router.post('/playlists/:playlistId/songs', auth, async (req: any, res) => {
  try {
    const { playlistId } = req.params;
    const { spotifyId, title, artist, album, albumArt } = req.body;

    const playlist = await Playlist.findOne({ 
      _id: playlistId, 
      user: req.user.userId 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    let song = await Song.findOne({ spotifyId });

    if (!song) {
      song = new Song({
        spotifyId,
        title,
        artist,
        album,
        albumArt: albumArt || ''
      });
      await song.save();
    }

    if (playlist.songs.includes(song._id)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(song._id);
    await playlist.save();

    await playlist.populate('songs');

    res.json(playlist);
  } catch (error) {
    console.log('Add song error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/playlists/:playlistId/songs/:songId', auth, async (req: any, res) => {
  try {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findOne({ 
      _id: playlistId, 
      user: req.user.userId 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter(
      (song: any) => song.toString() !== songId
    );
    await playlist.save();

    await playlist.populate('songs');

    res.json(playlist);
  } catch (error) {
    console.log('Remove song error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search', auth, async (req: any, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchResults = await searchTracks(q as string, 10);
    res.json(searchResults);
  } catch (error) {
    console.log('Search error:', error);
    res.status(500).json({ message: 'Failed to search songs' });
  }
});

export default router; 