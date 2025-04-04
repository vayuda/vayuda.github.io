import { MusicTheory } from "./music-theory.js";
import { SynthTypes } from "./synths.js";

export class Song {
  constructor(id, key, tempo) {
    this.id = id;
    this.key = key;
    this.tempo = tempo;
    this.tracks = {
      melody: new Track("melody"),
      harmony: new Track("harmony"),
      bass: new Track("bass"),
      drums: new Track("drums"),
    };
    this.progression = [];
  }
}

export class Track {
  constructor(type, volume = 0.8) {
    this.type = type; // Now uses SynthTypes
    this.synthType = this.getSynthType(type);
    this.volume = volume;
    this.muted = false;
    this.pattern = [];
  }

  getSynthType(type) {
    switch (type) {
      case "melody":
        return SynthTypes.LOFI_PIANO;
      case "harmony":
        return SynthTypes.PAD;
      case "bass":
        return SynthTypes.BASS;
      case "drums":
        return SynthTypes.DRUMS;
      default:
        throw new Error(`Unknown track type: ${type}`);
    }
  }
}

export class SongManager {
  constructor() {
    this.currentSong = null;
  }

  createNewSong() {
    const id = Date.now().toString();
    const key =
      MusicTheory.NOTES[Math.floor(Math.random() * MusicTheory.NOTES.length)];
    const tempo = Math.floor(Math.random() * (85 - 70) + 70); // 70-85 BPM

    const song = new Song(id, key, tempo);

    // Initialize tracks
    song.tracks.drums = new Track("drums");
    song.tracks.bass = new Track("bass");
    song.tracks.melody = new Track("melody");
    song.tracks.harmony = new Track("harmony");

    // Select random progression
    const progressions = Object.values(MusicTheory.CHORD_PROGRESSIONS);
    song.progression =
      progressions[Math.floor(Math.random() * progressions.length)];

    this.currentSong = song;
    return song;
  }
}
