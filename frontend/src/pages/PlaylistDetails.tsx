import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
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
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Add, Delete, Edit } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { playlistAPI, Playlist } from '../api/playlists';
import { songAPI } from '../api/songs';
import { useAuth } from '../context/AuthContext';

const editPlaylistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required'),
  description: z.string().optional(),
});

type EditPlaylistFormInputs = z.infer<typeof editPlaylistSchema>;

function PlaylistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditPlaylistFormInputs>({
    resolver: zodResolver(editPlaylistSchema),
  });

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await playlistAPI.getPlaylist(id);
        setPlaylist(data);
        reset({
          name: data.name,
          description: data.description,
        });
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load playlist');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && id) {
      loadPlaylist();
    }
  }, [id, user, reset]);

  const handleEditPlaylist = async (data: EditPlaylistFormInputs) => {
    if (!playlist || !id) return;
    
    try {
      const updatedPlaylist = await playlistAPI.updatePlaylist(id, data);
      setPlaylist(updatedPlaylist);
      setOpenEditDialog(false);
      reset({
        name: updatedPlaylist.name,
        description: updatedPlaylist.description,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update playlist');
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist || !id) return;
    
    try {
      const updatedPlaylist = await songAPI.removeSongFromPlaylist(id, songId);
      setPlaylist(updatedPlaylist);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to remove song');
    }
  };

  const handleAddSong = () => {
    navigate('/search');
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Please log in to view playlist details</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!playlist) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Playlist not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb:3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex',alignItems: 'center',mb: 3 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr:2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">{playlist.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            {playlist.description}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<Edit />}
          onClick={() => setOpenEditDialog(true)}
          sx={{ mr: 2 }}
        >
          Edit
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleAddSong}
        >
          Add Song
        </Button>
      </Box>

      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Songs ({playlist.songs.length})
          </Typography>
          {playlist.songs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No songs in this playlist yet. Click "Add Song" to get started!
            </Typography>
          ) : (
            <List>
              {playlist.songs.map((song, index) => (
                <ListItem key={song._id} divider={index < playlist.songs.length - 1}>
                  <ListItemText
                    primary={song.title}
                    secondary={`${song.artist} • ${song.album}`}
                  />
                    <IconButton 
                      edge="end" 
                      onClick={() => handleRemoveSong(song._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Playlist</DialogTitle>
        <form onSubmit={handleSubmit(handleEditPlaylist)}>
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
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default PlaylistDetails; 