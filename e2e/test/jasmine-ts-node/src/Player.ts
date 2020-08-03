import { Song } from "./Song";

export class Player {
  public currentlyPlayingSong: Song;
  public isPlaying: boolean;

  play(song: Song) {
    this.currentlyPlayingSong = song;
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  resume() {
    if (this.isPlaying) {
      throw new Error('song is already playing');
    }
    this.isPlaying = true;
  }

  makeFavorite() {
    this.currentlyPlayingSong.persistFavoriteStatus(true);
  }
}
