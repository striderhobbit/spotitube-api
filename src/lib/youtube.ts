import { google, youtube_v3 } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyAouToqXOazMJRLTPEWWJh58LrthyTcQdg',
});

export async function getPlaylist(
  id: string
): Promise<youtube_v3.Schema$Playlist> {
  return youtube.playlists
    .list({
      part: ['contentDetails', 'snippet'],
      id: [id],
    })
    .then(({ data }) => data.items![0]);
}

export async function getPlaylistItems(
  playlistId: string
): Promise<youtube_v3.Schema$PlaylistItem[]> {
  return getPlaylistItemListResponse(playlistId).then(
    async ({ items = [], nextPageToken }) => {
      if (nextPageToken == null) {
        return items;
      }

      return items.concat(
        (await getPlaylistItemListResponse(playlistId, nextPageToken)).items ??
          []
      );
    }
  );
}

async function getPlaylistItemListResponse(
  playlistId: string,
  pageToken?: string
): Promise<youtube_v3.Schema$PlaylistItemListResponse> {
  return youtube.playlistItems
    .list({
      part: ['contentDetails', 'snippet'],
      playlistId,
      pageToken,
    })
    .then(({ data }) => data);
}
