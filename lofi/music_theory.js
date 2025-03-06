export class MusicTheory {
    static NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    static SCALES = {
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10],
        pentatonicMajor: [0, 2, 4, 7, 9],
        pentatonicMinor: [0, 3, 5, 7, 10],
        blues: [0, 3, 5, 6, 7, 10]
    };

    static CHORD_TYPES = {
        major: [0, 4, 7],
        minor: [0, 3, 7],
        diminished: [0, 3, 6],
        augmented: [0, 4, 8],
        major7: [0, 4, 7, 11],
        minor7: [0, 3, 7, 10],
        dominant7: [0, 4, 7, 10]
    };

    static CHORD_PROGRESSIONS = {
        lofi1: ['ii', 'V', 'I', 'vi'],
        lofi2: ['vi', 'IV', 'I', 'V'],
        lofi3: ['I', 'vi', 'IV', 'V']
    };

    // For analyzing melodic motion
    static INTERVALS = {
        UNISON: 0,
        MINOR_SECOND: 1,
        MAJOR_SECOND: 2,
        MINOR_THIRD: 3,
        MAJOR_THIRD: 4,
        PERFECT_FOURTH: 5,
        TRITONE: 6,
        PERFECT_FIFTH: 7,
        MINOR_SIXTH: 8,
        MAJOR_SIXTH: 9,
        MINOR_SEVENTH: 10,
        MAJOR_SEVENTH: 11,
        OCTAVE: 12
    };

    // Tension levels for different intervals
    static INTERVAL_TENSION = {
        0: 0,    // Unison - no tension
        1: 0.9,  // Minor Second - high tension
        2: 0.3,  // Major Second - some tension
        3: 0.2,  // Minor Third - consonant
        4: 0.1,  // Major Third - very consonant
        5: 0.4,  // Perfect Fourth - mild tension
        6: 1.0,  // Tritone - maximum tension
        7: 0.1,  // Perfect Fifth - very consonant
        8: 0.5,  // Minor Sixth - mild tension
        9: 0.3,  // Major Sixth - some tension
        10: 0.8, // Minor Seventh - high tension
        11: 0.7, // Major Seventh - high tension
        12: 0.1  // Octave - very consonant
    };

    // Analysis methods
    static analyzeMelody(pattern) {
        const analysis = {
            highestNote: null,
            lowestNote: null,
            averagePitch: 0,
            rhythmicDensity: 0,
            intervals: [],
            tensions: [],
            strongBeats: [],
            contour: [] // rising, falling, or stable
        };

        let noteCount = 0;
        let lastNote = null;

        pattern.forEach((note, index) => {
            if (note) {
                // Track pitch range
                const midiNote = this.noteToMidi(note.note, note.octave);
                if (!analysis.highestNote || midiNote > analysis.highestNote) {
                    analysis.highestNote = midiNote;
                }
                if (!analysis.lowestNote || midiNote < analysis.lowestNote) {
                    analysis.lowestNote = midiNote;
                }

                // Calculate intervals and tension
                if (lastNote) {
                    const interval = Math.abs(
                        this.noteToMidi(note.note, note.octave) - 
                        this.noteToMidi(lastNote.note, lastNote.octave)
                    );
                    analysis.intervals.push(interval);
                    analysis.tensions.push(this.INTERVAL_TENSION[interval % 12]);
                }

                // Track strong beats
                if (index % 4 === 0) {
                    analysis.strongBeats.push(note);
                }

                lastNote = note;
                noteCount++;
            }
        });

        analysis.rhythmicDensity = noteCount / pattern.length;
        return analysis;
    }

    static findComplementaryNotes(melodyNote, chord, tension = 'low') {
        const chordNotes = this.getChordNotes(chord.root, chord.type);
        const complementary = [];
        const tensionLevels = {
            low: 0.3,
            medium: 0.5,
            high: 0.8
        };

        chordNotes.forEach(note => {
            const interval = Math.abs(
                this.NOTES.indexOf(melodyNote) - 
                this.NOTES.indexOf(note)
            ) % 12;
            
            if (this.INTERVAL_TENSION[interval] <= tensionLevels[tension]) {
                complementary.push(note);
            }
        });

        return complementary;
    }

    static createBassLine(chord, rhythmicDensity) {
        const chordNotes = this.getChordNotes(chord.root, chord.type);
        let bassPattern = [];

        // Simple walking bass for high density
        if (rhythmicDensity > 0.7) {
            bassPattern = [
                chordNotes[0], // root
                chordNotes[2], // fifth
                chordNotes[1], // third
                this.walkingBassNote(chord) // approach note
            ];
        } 
        // Root-fifth pattern for medium density
        else if (rhythmicDensity > 0.4) {
            bassPattern = [
                chordNotes[0], // root
                null,
                chordNotes[2], // fifth
                null
            ];
        }
        // Just root notes for low density
        else {
            bassPattern = [chordNotes[0], null, null, null];
        }

        return bassPattern;
    }

    static suggestDrumPattern(melodyAnalysis) {
        const kickPattern = [];
        const snarePattern = [];
        const hihatPattern = [];

        // Base kick pattern on strong beats
        melodyAnalysis.strongBeats.forEach((beat, index) => {
            // If melody has note on strong beat, reduce kick probability
            kickPattern[index * 4] = beat ? 0.5 : 1;
        });

        // Base snare density on melodic density
        const snareDensity = 1 - melodyAnalysis.rhythmicDensity;

        // Base hi-hat pattern on average tension
        const avgTension = melodyAnalysis.tensions.reduce((a, b) => a + b, 0) 
            / melodyAnalysis.tensions.length;

        return { kickPattern, snarePattern, hihatPattern };
    }

    // Utility methods
    static noteToMidi(note, octave) {
        return this.NOTES.indexOf(note) + (octave + 1) * 12;
    }

    static midiToNote(midi) {
        const octave = Math.floor(midi / 12) - 1;
        const note = this.NOTES[midi % 12];
        return { note, octave };
    }

    static walkingBassNote(chord) {
        // Calculate approach note to next chord
        // Implementation depends on chord progression context
    }
    static noteToFrequency(note, octave) {
        const A4 = 440;
        const A4_INDEX = 69; // MIDI note number for A4
        const noteIndex = this.NOTES.indexOf(note);
        const midiNumber = noteIndex + (octave + 1) * 12;
        return A4 * Math.pow(2, (midiNumber - A4_INDEX) / 12);
    }

    static getScaleNotes(root, scale) {
        const scalePattern = this.SCALES[scale];
        const rootIndex = this.NOTES.indexOf(root);
        return scalePattern.map(interval => 
            this.NOTES[(rootIndex + interval) % 12]
        );
    }

    static getChordNotes(root, chordType) {
        const rootIndex = this.NOTES.indexOf(root);
        let intervals;
        
        switch(chordType) {
            case 'major':
                intervals = [0, 4, 7];
                break;
            case 'minor':
                intervals = [0, 3, 7];
                break;
            case 'diminished':
                intervals = [0, 3, 6];
                break;
            default:
                intervals = [0, 4, 7];
        }

        return intervals.map(interval => 
            this.NOTES[(rootIndex + interval) % 12]
        );
    }

}