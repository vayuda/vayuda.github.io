// Core classes for state management
export class AudioSettings {
    constructor() {
        this.tempo = 80;
        this.key = 0;
        this.scaleMode = "major";
        this.lowestOctave = 3;
        this.octaveRange = 3;
        this.beatPattern = "lofi";
    }

    toJSON() {
        return {
            tempo: this.tempo,
            key: this.key,
            scaleMode: this.scaleMode,
            lowestOctave: this.lowestOctave,
            octaveRange: this.octaveRange,
            beatPattern: this.beatPattern,
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
    }
}

export class SynthSettings {
    constructor() {
        this.osc1Waveform = "sawtooth";
        this.osc2Waveform = "triangle";
        this.detuneAmount = 10;
        this.oscMix = 0.5;
        this.filterCutoff = 2000;
    }

    toJSON() {
        return {
            osc1Waveform: this.osc1Waveform,
            osc2Waveform: this.osc2Waveform,
            detuneAmount: this.detuneAmount,
            oscMix: this.oscMix,
            filterCutoff: this.filterCutoff,
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
    }
}

export class DrumSettings {
    constructor() {
        this.swing = 0.3;
        this.randomization = 0.3;
        this.volumes = {
            kick: 0.3,
            snare: 0.14,
            hihat: 0.04,
            synth: 0.5,
        };
        // Default drum patterns
        this.patterns = {
            lofi: [
                { kick: 1, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 0.3 },
                { kick: 0.1, snare: 0, hihat: 0.8 },
                { kick: 0, snare: 0, hihat: 0.3 },
                { kick: 0, snare: 1, hihat: 1 },
                { kick: 0, snare: 0, hihat: 0.3 },
                { kick: 0.2, snare: 0, hihat: 0.8 },
                { kick: 0, snare: 0, hihat: 0.3 },
                { kick: 1, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 0.3 },
                { kick: 0.1, snare: 0, hihat: 0.8 },
                { kick: 0, snare: 0, hihat: 0.3 },
                { kick: 0, snare: 1, hihat: 1 },
                { kick: 0, snare: 0.2, hihat: 0.3 },
                { kick: 0.2, snare: 0, hihat: 0.8 },
                { kick: 0, snare: 0.1, hihat: 0.3 },
            ],
            trap: [
                { kick: 1, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0.3, snare: 0, hihat: 1 },
                { kick: 0, snare: 1, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0.5, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0.8, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0.3, snare: 0, hihat: 1 },
                { kick: 0, snare: 1, hihat: 1 },
                { kick: 0.2, snare: 0, hihat: 1 },
                { kick: 0.5, snare: 0, hihat: 1 },
                { kick: 0.3, snare: 0.2, hihat: 1 },
            ],
            jazz: [
                { kick: 1, snare: 0, hihat: 0.8 },
                { kick: 0, snare: 0, hihat: 0.5 },
                { kick: 0, snare: 1, hihat: 0.8 },
                { kick: 0, snare: 0, hihat: 0.5 },
                { kick: 0.8, snare: 0, hihat: 0.8 },
                { kick: 0, snare: 0, hihat: 0.5 },
                { kick: 0, snare: 1, hihat: 0.8 },
                { kick: 0.3, snare: 0, hihat: 0.5 },
                { kick: 1, snare: 0, hihat: 0.8 },
                { kick: 0, snare: 0.3, hihat: 0.5 },
                { kick: 0, snare: 1, hihat: 0.8 },
                { kick: 0.2, snare: 0, hihat: 0.5 },
                { kick: 0.8, snare: 0, hihat: 0.8 },
                { kick: 0, snare: 0.2, hihat: 0.5 },
                { kick: 0, snare: 1, hihat: 0.8 },
                { kick: 0.3, snare: 0, hihat: 0.5 },
            ],
            house: [
                { kick: 1, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 1, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 1, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 1, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
                { kick: 0, snare: 0, hihat: 1 },
            ],
        };
    }
    generateRandomPattern(complexity = 0.5) {
        const pattern = [];
        const kickProbs = [1, 0.3, 0.1, 0.2]; // Strong beats
        const snareProbs = [0.8, 0.2, 0.1, 0.1]; // Backbeats
        const hihatProbs = [0.9, 0.7, 0.8, 0.7]; // Consistent rhythm

        for (let i = 0; i < 16; i++) {
            const beat = i % 4;
            const randomFactor = Math.random() * complexity;

            let kick =
                Math.random() < kickProbs[beat] * randomFactor
                    ? 1
                    : 0;
            let snare =
                Math.random() < snareProbs[beat] * randomFactor
                    ? 1
                    : 0;
            let hihat =
                Math.random() < hihatProbs[beat] * randomFactor
                    ? 1
                    : 0;

            // Ensure kick and snare don't play simultaneously
            if (kick && snare) {
                if (Math.random() > 0.5) snare = 0;
                else kick = 0;
            }

            pattern.push({ kick, snare, hihat });
        }

        return pattern;
    }

    randomizeCurrentPattern() {
        const randomPattern = this.generateRandomPattern();
        this.patterns["random"] = randomPattern;
        return randomPattern;
    }

    toJSON() {
        return {
            swing: this.swing,
            randomization: this.randomization,
            volumes: { ...this.volumes },
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
    }
}

export class MelodySettings {
    constructor() {
        this.rhythmDensity = 0.5;
        this.syncopationAmount = 0.3;
        this.noteLength = 0.3;
        this.rhythmVariation = 0.5;
    }

    toJSON() {
        return {
            rhythmDensity: this.rhythmDensity,
            syncopationAmount: this.syncopationAmount,
            noteLength: this.noteLength,
            rhythmVariation: this.rhythmVariation,
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
    }
}

export class EffectSettings {
    constructor() {
        this.staticNoiseLevel = 0;
        this.filterCutoff = 2000;
    }

    toJSON() {
        return {
            staticNoiseLevel: this.staticNoiseLevel,
            filterCutoff: this.filterCutoff,
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
    }
}
