import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

const getAccessToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    return data.body.access_token;
  } catch (error) {
    console.log('Error getting Spotify access token:', error);
    throw error;
  }
};

export const searchTracks = async (query: string, limit: number = 10) => {
  try {
    await getAccessToken();

    const response = await spotifyApi.searchTracks(query, {
      limit,
      offset: 0,
    });

    return response.body.tracks?.items.map(track => ({
      id: track.id,
      spotifyId: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || '',
      duration: track.duration_ms,
      previewUrl: track.preview_url,
    })) || [];
  } catch (error) {
    console.log('Error searching Spotify tracks:', error);
    throw error;
  }
};

export const getTrack = async (trackId: string) => {
  try {
    await getAccessToken();

    const response = await spotifyApi.getTrack(trackId);
    const track = response.body;

    return {
      id: track.id,
      spotifyId: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || '',
      duration: track.duration_ms,
      previewUrl: track.preview_url,
    };
  } catch (error) {
    console.log('Error getting Spotify track:', error);
    throw error;
  }
}; 