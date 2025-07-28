import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { songAPI, SearchResult } from '../api/songs';
import { playlistAPI, Playlist } from '../api/playlists';
import { useAuth } from '../context/AuthContext';

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

type SearchFormInputs = z.infer<typeof searchSchema>;



function SpotifySearch() {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SearchResult | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<SearchFormInputs>({
    resolver: zodResolver(searchSchema),
  });

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!user) return;
      
      try {
        const data = await playlistAPI.getPlaylists();
        setPlaylists(data);
      } catch (error: any) {
        console.log('Failed to load playlists:', error);
      }
    };

    loadPlaylists();
  }, [user]);

  const onSearch = async (data: SearchFormInputs) => {
    try {
      setIsLoading(true);
      setError('');
      const results = await songAPI.searchSongs(data.query);
      setSearchResults(results);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to search songs');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = (song: SearchResult) => {
    setSelectedSong(song);
    setOpenAddDialog(true);
  };

  const handleConfirmAdd = async () => {
    if (selectedSong && selectedPlaylist) {
      try {
        await songAPI.addSongToPlaylist(selectedPlaylist, {
          spotifyId: selectedSong.id,
          title: selectedSong.title,
          artist: selectedSong.artist,
          album: selectedSong.album,
          albumArt: selectedSong.albumArt,
        });
        
        alert(`Added "${selectedSong.title}" to playlist!`);
        setOpenAddDialog(false);
        setSelectedSong(null);
        setSelectedPlaylist('');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to add song to playlist');
      }
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Please log in to search for songs</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Search Spotify
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit(onSearch)}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Search songs"
                fullWidth
                {...register('query')}
                error={!!errors.query}
                helperText={errors.query?.message}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={<Search />}
                sx={{ minWidth: 120 }}
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {searchResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search Results ({searchResults.length})
            </Typography>
            <List>
              {searchResults.map((song, index) => (
                <ListItem key={song.id} divider={index < searchResults.length - 1}>
                  <ListItemText
                    primary={song.title}
                    secondary={`${song.artist} • ${song.album}`}
                  />
                    <IconButton 
                      edge="end" 
                      onClick={() => handleAddToPlaylist(song)}
                      color="primary"
                    >
                      <Add />
                    </IconButton>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add to Playlist</DialogTitle>
        <DialogContent>
          {selectedSong && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{selectedSong.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSong.artist} • {selectedSong.album}
              </Typography>
            </Box>
          )}
          <FormControl fullWidth>
            <InputLabel>Select Playlist</InputLabel>
            <Select
              value={selectedPlaylist}
              label="Select Playlist"
              onChange={(e) => setSelectedPlaylist(e.target.value)}
            >
              {playlists.map((playlist) => (
                <MenuItem key={playlist._id} value={playlist._id}>
                  {playlist.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmAdd} 
            variant="contained"
            disabled={!selectedPlaylist}
          >
            Add to Playlist
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SpotifySearch; 