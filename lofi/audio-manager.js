import { SynthFactory } from './synths.js';
import { SongManager } from './song-manager.js';
import { PatternCoordinator } from './pattern-generator.js';

export class AudioEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.tracks = new Map();
        
        this.isPlaying = false;
        this.currentSong = null;
        this.songManager = new SongManager();
        this.patternCoordinator = new PatternCoordinator();
        
        // Scheduling
        this.schedulerInterval = null;
        this.nextNoteTime = 0.0;
        this.currentBeat = 0;
        this.lookAhead = 0.1;  // How far ahead to schedule audio (seconds)
        this.scheduleAheadTime = 0.2;  // How far ahead to schedule notes
    }

    init() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
    }

    generateNewSong() {
        const song = this.songManager.createNewSong();
        return this.patternCoordinator.generateFullPattern(
            song.key, 
            song.progression[0],
            2  // measures
        );
    }

    play() {
        if (!this.context) this.init();
        
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        if (!this.currentSong) {
            this.currentSong = this.generateNewSong();
        }

        if (!this.isPlaying) {
            this.isPlaying = true;
            this.nextNoteTime = this.context.currentTime;
            this.scheduler();
            this.schedulerInterval = setInterval(() => this.scheduler(), 25);
        }
    }

    pause() {
        this.isPlaying = false;
        clearInterval(this.schedulerInterval);
        this.schedulerInterval = null;
    }

    stop() {
        this.pause();
        this.tracks.forEach(synth => synth.stopAll());
        this.currentBeat = 0;
    }

    skipToNext() {
        this.stop();
        this.currentSong = this.generateNewSong();
        if (this.isPlaying) {
            this.play();
        }
    }

    scheduler() {
        while (this.nextNoteTime < this.context.currentTime + this.scheduleAheadTime) {
            this.scheduleNotes(this.nextNoteTime);
            this.advanceNote();
        }
    }

    scheduleNotes(time) {
        Object.entries(this.currentSong.tracks).forEach(([trackId, track]) => {
            if (!track.muted && track.pattern[this.currentBeat]) {
                if (!this.tracks.has(trackId)) {
                    this.initializeTrack(trackId, track.synthType);
                }
                
                const synth = this.tracks.get(trackId);
                const note = track.pattern[this.currentBeat];
                const duration = this.getNoteDuration(this.currentSong.tempo);
                
                synth.playNote(note, time, duration);
            }
        });
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.currentSong.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat;  // 16th notes
        this.currentBeat = (this.currentBeat + 1) % 32;  // 2 measures of 16th notes

        // Generate new pattern when we reach the end
        if (this.currentBeat === 0) {
            this.currentSong = this.generateNewSong();
        }
    }

    initializeTrack(trackId, synthType) {
        const synth = SynthFactory.createSynth(synthType, this.context, this.masterGain);
        this.tracks.set(trackId, synth);
    }

    getNoteDuration(tempo) {
        return (60 / tempo) / 4;  // Duration of a 16th note
    }

    setTrackVolume(trackId, volume) {
        const synth = this.tracks.get(trackId);
        if (synth) {
            synth.setVolume(volume);
        }
    }

    muteTrack(trackId) {
        const synth = this.tracks.get(trackId);
        if (synth) {
            synth.mute();
        }
    }

    unmuteTrack(trackId) {
        const synth = this.tracks.get(trackId);
        if (synth) {
            synth.unmute();
        }
    }

    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(volume, this.context.currentTime);
        }
    }
}