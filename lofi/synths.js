class BaseSynth {
    constructor(context, destination) {
        this.context = context;
        this.destination = destination;
        this.volume = this.context.createGain();
        this.volume.connect(destination);
        this.activeVoices = new Map();
    }

    setVolume(value) {
        this.volume.gain.setValueAtTime(value, this.context.currentTime);
    }

    mute() {
        this.volume.gain.setValueAtTime(0, this.context.currentTime);
    }

    unmute() {
        this.volume.gain.setValueAtTime(1, this.context.currentTime);
    }

    stopAll() {
        this.activeVoices.forEach(voice => {
            voice.stop();
        });
        this.activeVoices.clear();
    }
}



export class SynthFactory {
    static createSynth(type, context, destination) {
        switch(type) {
            case SynthTypes.LOFI_PIANO:
                return new LofiPianoSynth(context, destination);
            case SynthTypes.PAD:
                return new PadSynth(context, destination);
            case SynthTypes.BASS:
                return new BassSynth(context, destination);
            case SynthTypes.DRUMS:
                return new DrumSynth(context, destination);
            default:
                throw new Error(`Unknown synth type: ${type}`);
        }
    }
}

export class LofiPianoSynth extends BaseSynth {
    constructor(context, destination) {
        super(context, destination);
        this.filter = context.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 2000;
        this.filter.connect(this.volume);
    }

    playNote(note, time, duration) {
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        const amp = this.context.createGain();
        
        // Slightly detuned oscillators
        osc1.type = 'triangle';
        osc2.type = 'sine';
        
        const frequency = MusicTheory.noteToFrequency(note.note, note.octave);
        osc1.frequency.setValueAtTime(frequency, time);
        osc2.frequency.setValueAtTime(frequency * 1.002, time);

        // Piano-like envelope
        amp.gain.setValueAtTime(0, time);
        amp.gain.linearRampToValueAtTime(note.velocity || 0.7, time + 0.005);
        amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc1.connect(amp);
        osc2.connect(amp);
        amp.connect(this.filter);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);

        this.activeVoices.set(note, { osc1, osc2, amp });
    }
}

export class PadSynth extends BaseSynth {
    constructor(context, destination) {
        super(context, destination);
        this.filter = context.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 1500;
        this.filter.connect(this.volume);
    }

    playNote(chord, time, duration) {
        chord.notes.forEach(note => {
            const osc1 = this.context.createOscillator();
            const osc2 = this.context.createOscillator();
            const amp = this.context.createGain();
            
            osc1.type = 'sine';
            osc2.type = 'triangle';
            
            const frequency = MusicTheory.noteToFrequency(note.note, note.octave);
            osc1.frequency.setValueAtTime(frequency, time);
            osc2.frequency.setValueAtTime(frequency * 1.001, time);

            // Pad-like envelope with slow attack
            amp.gain.setValueAtTime(0, time);
            amp.gain.linearRampToValueAtTime(chord.velocity || 0.5, time + 0.1);
            amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc1.connect(amp);
            osc2.connect(amp);
            amp.connect(this.filter);

            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + duration);
            osc2.stop(time + duration);

            this.activeVoices.set(note, { osc1, osc2, amp });
        });
    }
}

export class BassSynth extends BaseSynth {
    constructor(context, destination) {
        super(context, destination);
        this.filter = context.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 500;
        this.filter.connect(this.volume);
    }

    playNote(note, time, duration) {
        const osc = this.context.createOscillator();
        const amp = this.context.createGain();
        
        osc.type = 'sawtooth';
        const frequency = MusicTheory.noteToFrequency(note.note, note.octave);
        osc.frequency.setValueAtTime(frequency, time);

        amp.gain.setValueAtTime(0, time);
        amp.gain.linearRampToValueAtTime(note.velocity || 0.8, time + 0.02);
        amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(amp);
        amp.connect(this.filter);

        osc.start(time);
        osc.stop(time + duration);

        this.activeVoices.set(note, { osc, amp });
    }
}

export class DrumSynth extends BaseSynth {
    constructor(context, destination) {
        super(context, destination);
    }

    playNote(drumNote, time, duration) {
        if (drumNote.kick) this.playKick(time, drumNote.kick);
        if (drumNote.snare) this.playSnare(time, drumNote.snare);
        if (drumNote.hihat) this.playHiHat(time, drumNote.hihat);
    }

    playKick(time, velocity) {
        const osc = this.context.createOscillator();
        const amp = this.context.createGain();
        
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        
        amp.gain.setValueAtTime(velocity, time);
        amp.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

        osc.connect(amp);
        amp.connect(this.volume);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    playSnare(time, velocity) {
        // Noise + tone for snare
        const noise = this.createNoiseBuffer();
        const noiseGain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        noiseGain.gain.setValueAtTime(velocity, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.volume);

        noise.start(time);
        noise.stop(time + 0.2);
    }

    playHiHat(time, velocity) {
        const noise = this.createNoiseBuffer();
        const noiseGain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        noiseGain.gain.setValueAtTime(velocity * 0.3, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.volume);

        noise.start(time);
        noise.stop(time + 0.1);
    }

    createNoiseBuffer() {
        const bufferSize = this.context.sampleRate * 2;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        return noise;
    }
}

export const SynthTypes = {
    LOFI_PIANO: 'lofiPiano',
    PAD: 'pad',
    BASS: 'bass',
    DRUMS: 'drums',
    // Add more synth types as needed
};