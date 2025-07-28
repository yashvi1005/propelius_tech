import api from './index';
import { Playlist } from './playlists';

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
}

export interface AddSongData {
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
}

export const songAPI = {
  searchSongs: async (query: string): Promise<SearchResult[]> => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  addSongToPlaylist: async (playlistId: string, songData: AddSongData): Promise<Playlist> => {
    const response = await api.post(`/playlists/${playlistId}/songs`, songData);
    return response.data;
  },

  removeSongFromPlaylist: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },
}; 