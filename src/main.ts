import ffmpegPath from 'ffmpeg-static';
import Ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import { getPlaylistItems } from './lib/youtube';
import { Server } from './server';

(async function () {
  console.log(
    await getPlaylistItems('OLAK5uy_ngHA0m-kQe3z7cNJLhLAkyG4jemXZ3CAU')
  );
});

(function () {
  Ffmpeg({
    source: ytdl('JHn2CKfXwUE', { filter: (format) => format.itag === 140 }).on(
      'data',
      console.log
    ),
  })
    .setFfmpegPath(ffmpegPath!)
    .on('progress', console.log)
    .toFormat('mp3')
    .saveToFile('foo.mp3');
});

new Server({
  port: 3000,
  onstart: () => {
    // getTrack('2TpxZ7JUBn3uw46aR7qd6V').then(console.log);
  },
});
