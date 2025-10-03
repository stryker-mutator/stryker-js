import { Player } from "../../src/Player.ts";
import { Song } from "../../src/Song.ts";

beforeEach(function () {
  jasmine.addMatchers({
    toBePlaying: function () {
      return {
        compare: function (actual: Player, expected: Song) {
          var player = actual;

          return {
            pass: player.currentlyPlayingSong === expected && player.isPlaying
          }
        }
      };
    }
  });
});


