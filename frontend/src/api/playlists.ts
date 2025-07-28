import api from './index';

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  user: string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  _id: string;
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
}

export interface CreatePlaylistData {
  name: string;
  description?: string;
}

export interface UpdatePlaylistData {
  name: string;
  description?: string;
}

export const playlistAPI = {
  getPlaylists: async (): Promise<Playlist[]> => {
    const response = await api.get('/playlists');
    return response.data;
  },

  getPlaylist: async (id: string): Promise<Playlist> => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  createPlaylist: async (data: CreatePlaylistData): Promise<Playlist> => {
    const response = await api.post('/playlists', data);
    return response.data;
  },

  updatePlaylist: async (id: string, data: UpdatePlaylistData): Promise<Playlist> => {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data;
  },

  deletePlaylist: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },
}; 