import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { playlistAPI, Playlist } from '../api/playlists';
import { useAuth } from '../context/AuthContext';

const playlistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required'),
  description: z.string().optional(),
});

type PlaylistFormInputs = z.infer<typeof playlistSchema>;

function Dashboard() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PlaylistFormInputs>({
    resolver: zodResolver(playlistSchema),
  });

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setIsLoading(true);
        const data = await playlistAPI.getPlaylists();
        setPlaylists(data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load playlists');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const onSubmit = async (data: PlaylistFormInputs) => {
    try {
      const newPlaylist = await playlistAPI.createPlaylist(data);
      setPlaylists([...playlists, newPlaylist]);
      setOpenDialog(false);
      reset();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create playlist');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await playlistAPI.deletePlaylist(id);
      setPlaylists(playlists.filter(playlist => playlist._id !== id));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete playlist');
    }
  };

  const handleViewPlaylist = (id: string) => {
    navigate(`/playlist/${id}`);
  };

  if (!user) {
    return (
      <Box sx={{ p:3, textAlign:'center' }}>
        <Typography variant="h5">Please log in to view your playlists</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 3 }}>
        <Typography variant="h4">My Playlist</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Create Playlist
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {playlists.map((playlist) => (
            <Card key={playlist._id}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {playlist.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {playlist.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {playlist.songs.length} songs
                </Typography>
                <Box sx={{ mt:2, display:'flex', gap:1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewPlaylist(playlist._id)}
                    color="primary"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() =>handleDelete(playlist._id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Playlist</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              label="Playlist Name"
              fullWidth
              margin="normal"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Description (optional)"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Dashboard; 