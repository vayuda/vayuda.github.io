import { MusicTheory } from "./music_theory.js";

class BasePatternGenerator {
  constructor() {
    this.tensionLevel = 0.3; // Default tension level
    this.rhythmicComplexity = 0.5; // Default rhythmic complexity
  }

  // Utility method for consistent pseudo-random values
  getPseudoRandomValue(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Calculate velocity based on beat position and tension
  calculateVelocity(beat, tension = this.tensionLevel) {
    let velocity = 1.0;

    // Stronger velocity on main beats
    if (beat % 4 === 0) {
      velocity *= 1.2;
    }

    // Reduce velocity on weak beats
    if (beat % 2 !== 0) {
      velocity *= 0.8;
    }

    // Add variation based on tension
    velocity *= 0.8 + tension * 0.4;

    // Ensure velocity stays within valid range
    return Math.min(1.0, Math.max(0.1, velocity));
  }

  // Helper method to calculate tension between two notes
  calculateInterval(note1, note2) {
    const midi1 = MusicTheory.noteToMidi(note1.note, note1.octave);
    const midi2 = MusicTheory.noteToMidi(note2.note, note2.octave);
    return Math.abs(midi1 - midi2) % 12;
  }

  // Helper method to get tension level for an interval
  getIntervalTension(interval) {
    return MusicTheory.INTERVAL_TENSION[interval];
  }

  // Helper method to check if a note is in a scale
  isNoteInScale(note, key, scale) {
    const scaleNotes = MusicTheory.getScaleNotes(key, scale);
    return scaleNotes.includes(note);
  }

  // Helper method to get next scale degree
  getNextScaleNote(currentNote, key, scale, direction = 1) {
    const scaleNotes = MusicTheory.getScaleNotes(key, scale);
    const currentIndex = scaleNotes.indexOf(currentNote);
    const nextIndex =
      (currentIndex + direction + scaleNotes.length) % scaleNotes.length;
    return scaleNotes[nextIndex];
  }

  // Helper method to check if a note is in a chord
  isNoteInChord(note, chord) {
    const chordNotes = MusicTheory.getChordNotes(chord.root, chord.type);
    return chordNotes.includes(note);
  }

  // Helper method to add rhythmic variation
  addRhythmicVariation(basePattern, complexity = this.rhythmicComplexity) {
    return basePattern.map((value, index) => {
      if (value) {
        const variation = this.getPseudoRandomValue(index) * complexity;
        return Math.max(0.1, value * (1 - variation));
      }
      return value;
    });
  }

  // Base generate pattern method to be overridden by child classes
  generatePattern(key, chord, measures = 2, previousPattern = null) {
    throw new Error("generatePattern must be implemented by child class");
  }
}

class BassGenerator extends BasePatternGenerator {
  constructor() {
    super();
    this.rhythmicComplexity = 0.2; // Keep it simpler than other parts

    // Basic bass patterns
    this.bassPatterns = {
      simple: [
        // Basic root notes on strong beats
        1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
      ],
      rootFifth: [
        // Root and fifth movement
        1, 0, 0, 0, 0, 0, 0.7, 0, 1, 0, 0, 0, 0, 0, 0.7, 0,
      ],
      walking: [
        // Walking bass pattern
        1, 0, 0.7, 0, 0.8, 0, 0.7, 0, 1, 0, 0.7, 0, 0.8, 0, 0.7, 0,
      ],
    };
  }

  generatePattern(key, chord, measures = 2, melodyPattern) {
    const analysis = MusicTheory.analyzeMelody(melodyPattern);
    const pattern = [];

    // Choose base pattern based on melody activity
    let basePattern = this.selectBasePattern(analysis.rhythmicDensity);

    // Get chord tones for bass line construction
    const chordTones = MusicTheory.getChordNotes(chord.root, chord.type);

    for (let measure = 0; measure < measures; measure++) {
      for (let beat = 0; beat < 16; beat++) {
        const globalBeat = measure * 16 + beat;
        const melodyNote = melodyPattern[globalBeat];

        if (basePattern[beat]) {
          const bassNote = this.selectBassNote(
            beat,
            chord,
            chordTones,
            basePattern[beat],
          );

          // Only add bass note if there isn't too much activity
          if (this.shouldPlayBass(melodyNote, analysis, beat)) {
            pattern.push({
              note: bassNote.note,
              octave: bassNote.octave,
              duration: this.calculateBassDuration(beat),
              velocity: basePattern[beat],
            });
          } else {
            pattern.push(null);
          }
        } else {
          pattern.push(null);
        }
      }
    }

    return pattern;
  }

  selectBasePattern(melodyDensity) {
    // Choose simpler patterns when melody is dense
    if (melodyDensity > 0.7) {
      return this.bassPatterns.simple;
    } else if (melodyDensity > 0.4) {
      return this.bassPatterns.rootFifth;
    } else {
      return this.bassPatterns.walking;
    }
  }

  selectBassNote(beat, chord, chordTones, strength) {
    // On strong beats, use root note
    if (beat % 4 === 0) {
      return {
        note: chord.root,
        octave: 2,
      };
    }

    // On other emphasized beats, alternate between root and fifth
    if (strength > 0.6) {
      return {
        note: chordTones[beat % 2 === 0 ? 0 : 2], // alternate root and fifth
        octave: 2,
      };
    }

    // For walking bass moments, use chord tones
    return {
      note: chordTones[beat % chordTones.length],
      octave: 2,
    };
  }

  shouldPlayBass(melodyNote, analysis, beat) {
    // Always play on main beats
    if (beat % 4 === 0) return true;

    // Avoid playing when melody is in low register
    if (melodyNote && melodyNote.octave < 4) return false;

    // Reduce bass activity during dense melody sections
    if (analysis.rhythmicDensity > 0.7 && beat % 2 !== 0) return false;

    return true;
  }

  calculateBassDuration(beat) {
    // Longer notes on main beats
    if (beat % 4 === 0) {
      return 0.5; // half note
    }
    // Medium length on secondary beats
    if (beat % 2 === 0) {
      return 0.25; // quarter note
    }
    // Shorter notes for walking bass moments
    return 0.125; // eighth note
  }

  // Additional method for smoother bass lines
  createBassTransition(fromNote, toNote) {
    // If notes are far apart, create a smoother transition
    const fromPitch = MusicTheory.noteToMidi(fromNote.note, fromNote.octave);
    const toPitch = MusicTheory.noteToMidi(toNote.note, toNote.octave);

    if (Math.abs(fromPitch - toPitch) > 7) {
      // Create a stepping stone note halfway between
      const midPitch = Math.floor((fromPitch + toPitch) / 2);
      return MusicTheory.midiToNote(midPitch);
    }

    return toNote;
  }
}

class MelodyGenerator extends BasePatternGenerator {
  constructor() {
    super();
    this.currentMotif = null;
    this.rhythmicComplexity = 0.5;

    // Define core melodic patterns
    this.melodicPatterns = {
      ascending: {
        intervals: [2, 2, 1, 2], // stepwise up
        rhythmPattern: [1, 0, 1, 0, 1, 0, 1, 0],
        preferredLength: 4,
      },
      descending: {
        intervals: [-2, -2, -1, -2], // stepwise down
        rhythmPattern: [1, 0, 1, 0, 1, 0, 1, 0],
        preferredLength: 4,
      },
      arpeggiated: {
        intervals: [4, 3, 4], // thirds up
        rhythmPattern: [1, 0, 0, 1, 0, 0, 1, 0],
        preferredLength: 3,
      },
      question: {
        intervals: [2, 2, -1], // rising question
        rhythmPattern: [1, 0, 1, 0, 1, 0],
        preferredLength: 3,
      },
      answer: {
        intervals: [-2, -2, -3], // falling answer
        rhythmPattern: [1, 0, 1, 0, 1],
        preferredLength: 3,
      },
    };

    // Different ways to develop motifs
    this.developments = {
      inversion: (intervals) => intervals.map((i) => -i),
      retrograde: (intervals) => [...intervals].reverse(),
      augmentation: (rhythm) => rhythm.map((r) => r).flatMap((r) => [r, 0]),
      diminution: (rhythm) => rhythm.filter((_, i) => i % 2 === 0),
      transposition: (intervals, amount) => intervals.map((i) => i + amount),
    };
  }

  generatePattern(key, chord, measures = 2, previousPattern = null) {
    const pattern = [];
    const scaleNotes = MusicTheory.getScaleNotes(key, "pentatonicMinor");

    // Decide whether to develop previous motif or create new one
    if (previousPattern && this.currentMotif && Math.random() < 0.7) {
      this.developCurrentMotif();
    } else {
      this.createNewMotif(scaleNotes);
    }

    let currentNote = {
      note: scaleNotes[Math.floor(Math.random() * scaleNotes.length)],
      octave: 4,
    };

    for (let measure = 0; measure < measures; measure++) {
      for (let beat = 0; beat < 16; beat++) {
        const shouldPlay = this.shouldPlayNote(beat, measure);

        if (shouldPlay) {
          // Get next note based on current motif
          const nextNote = this.getNextMotifNote(currentNote, scaleNotes);

          pattern.push({
            note: nextNote.note,
            octave: nextNote.octave,
            duration: this.calculateNoteDuration(beat, measure),
            velocity: this.calculateVelocity(beat, this.tensionLevel),
          });

          currentNote = nextNote;
        } else {
          pattern.push(null);
        }
      }
    }

    return pattern;
  }

  createNewMotif(scaleNotes) {
    // Randomly select a base pattern type
    const patternTypes = Object.keys(this.melodicPatterns);
    const selectedType =
      patternTypes[Math.floor(Math.random() * patternTypes.length)];
    const basePattern = this.melodicPatterns[selectedType];

    this.currentMotif = {
      type: selectedType,
      intervals: [...basePattern.intervals],
      rhythmPattern: [...basePattern.rhythmPattern],
      startingNote: scaleNotes[Math.floor(Math.random() * scaleNotes.length)],
      currentPosition: 0,
    };
  }

  developCurrentMotif() {
    // Randomly select a development technique
    const developments = Object.keys(this.developments);
    const development =
      developments[Math.floor(Math.random() * developments.length)];

    if (development === "transposition") {
      const amount = Math.floor(Math.random() * 3) + 1;
      this.currentMotif.intervals = this.developments.transposition(
        this.currentMotif.intervals,
        amount,
      );
    } else if (development === "augmentation" || development === "diminution") {
      this.currentMotif.rhythmPattern = this.developments[development](
        this.currentMotif.rhythmPattern,
      );
    } else {
      this.currentMotif.intervals = this.developments[development](
        this.currentMotif.intervals,
      );
    }

    // Increase tension slightly with each development
    this.tensionLevel = Math.min(1, this.tensionLevel + 0.1);
  }

  getNextMotifNote(currentNote, scaleNotes) {
    const currentIndex = scaleNotes.indexOf(currentNote.note);
    const interval =
      this.currentMotif.intervals[this.currentMotif.currentPosition];

    // Calculate new note index
    let newIndex = currentIndex + interval;
    let octaveChange = 0;

    // Handle octave changes
    while (newIndex >= scaleNotes.length) {
      newIndex -= scaleNotes.length;
      octaveChange++;
    }
    while (newIndex < 0) {
      newIndex += scaleNotes.length;
      octaveChange--;
    }

    // Update motif position
    this.currentMotif.currentPosition =
      (this.currentMotif.currentPosition + 1) %
      this.currentMotif.intervals.length;

    return {
      note: scaleNotes[newIndex],
      octave: currentNote.octave + octaveChange,
    };
  }

  shouldPlayNote(beat, measure) {
    // Check against current motif's rhythm pattern
    const rhythmPosition = beat % this.currentMotif.rhythmPattern.length;
    const baseProb = this.currentMotif.rhythmPattern[rhythmPosition];

    // Add some randomization based on rhythmic complexity
    const randomFactor = this.getPseudoRandomValue(beat + measure * 16);
    return randomFactor < baseProb * this.rhythmicComplexity;
  }

  calculateNoteDuration(beat, measure) {
    // Base duration on position in measure and rhythm pattern
    const baseLength = 0.25; // quarter note
    const position = beat % 4;

    // Longer notes on strong beats
    if (position === 0 && Math.random() < 0.3) {
      return baseLength * 2;
    }

    // Shorter notes for more rhythmic passages
    if (this.rhythmicComplexity > 0.7 && Math.random() < 0.3) {
      return baseLength * 0.5;
    }

    return baseLength;
  }
}

class HarmonyGenerator extends BasePatternGenerator {
  generatePattern(key, chord, measures = 2, melodyPattern) {
    const analysis = MusicTheory.analyzeMelody(melodyPattern);
    const pattern = [];

    // Get the basic chord tones
    const chordTones = MusicTheory.getChordNotes(chord.root, chord.type);

    for (let measure = 0; measure < measures; measure++) {
      for (let beat = 0; beat < 16; beat++) {
        const globalBeat = measure * 16 + beat;
        const melodyNote = melodyPattern[globalBeat];

        if (melodyNote) {
          // Find complementary notes based on melody note
          const complementary = MusicTheory.findComplementaryNotes(
            melodyNote.note,
            chord,
            analysis.tensions[globalBeat] > 0.5 ? "high" : "low",
          );

          // Create harmony voicing
          const voicing = this.createVoicing(
            complementary,
            melodyNote,
            chordTones,
            analysis.tensions[globalBeat],
          );

          pattern.push({
            notes: voicing,
            duration: this.calculateHarmonyDuration(beat),
            velocity: 0.8,
          });
        } else {
          // During melody rests, use simple chord tones
          if (beat % 4 === 0) {
            // Only on main beats
            pattern.push({
              notes: chordTones,
              duration: 0.25,
              velocity: 0.6,
            });
          } else {
            pattern.push(null);
          }
        }
      }
    }

    return pattern;
  }

  createVoicing(complementaryNotes, melodyNote, chordTones, tension) {
    const voicing = [];
    const melodyPitch = MusicTheory.noteToMidi(
      melodyNote.note,
      melodyNote.octave,
    );

    // Add notes below melody
    complementaryNotes.forEach((note) => {
      const pitch = MusicTheory.noteToMidi(note, melodyNote.octave - 1);
      if (pitch < melodyPitch - 3) {
        // Avoid too close to melody
        voicing.push({ note, octave: melodyNote.octave - 1 });
      }
    });

    // Add chord tones in middle register
    chordTones.forEach((note) => {
      const pitch = MusicTheory.noteToMidi(note, melodyNote.octave - 1);
      if (
        !voicing.find((v) => MusicTheory.noteToMidi(v.note, v.octave) === pitch)
      ) {
        voicing.push({ note, octave: melodyNote.octave - 1 });
      }
    });

    return voicing;
  }

  calculateHarmonyDuration(beat) {
    // Longer durations on main beats
    if (beat % 4 === 0) return 0.5;
    return 0.25;
  }
}

class DrumGenerator extends BasePatternGenerator {
  constructor() {
    super();
    this.rhythmicComplexity = 0.4;

    // Common drum patterns as templates
    this.kickTemplates = {
      simple: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      syncopated: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
      dense: [1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0],
    };

    this.snareTemplates = {
      simple: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      ghost: [0, 0.3, 1, 0.3, 0, 0.3, 1, 0.3, 0, 0.3, 1, 0.3, 0, 0.3, 1, 0.3],
      sparse: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0.7, 0, 0, 0, 1, 0],
    };

    this.hihatTemplates = {
      eighth: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      sixteenth: [
        1, 0.7, 1, 0.7, 1, 0.7, 1, 0.7, 1, 0.7, 1, 0.7, 1, 0.7, 1, 0.7,
      ],
      offbeat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    };
  }

  generatePattern(measures = 2, melodyPattern) {
    const analysis = MusicTheory.analyzeMelody(melodyPattern);
    const pattern = [];

    // Calculate overall characteristics based on melody
    const density = analysis.rhythmicDensity;
    const activity = this.calculateRhythmicActivity(melodyPattern);
    const accentPoints = this.findAccentPoints(melodyPattern);

    // Choose base templates based on melody characteristics
    let kickBase =
      density > 0.6
        ? this.kickTemplates.dense
        : density > 0.3
          ? this.kickTemplates.syncopated
          : this.kickTemplates.simple;

    let snareBase =
      activity > 0.6
        ? this.snareTemplates.ghost
        : activity > 0.3
          ? this.snareTemplates.simple
          : this.snareTemplates.sparse;

    let hihatBase =
      density > 0.7
        ? this.hihatTemplates.sixteenth
        : density > 0.4
          ? this.hihatTemplates.eighth
          : this.hihatTemplates.offbeat;

    for (let measure = 0; measure < measures; measure++) {
      for (let beat = 0; beat < 16; beat++) {
        const globalBeat = measure * 16 + beat;
        const melodyNote = melodyPattern[globalBeat];

        // Adjust patterns based on melody
        let kick = this.adjustKick(kickBase[beat], melodyNote, beat);
        let snare = this.adjustSnare(snareBase[beat], melodyNote, beat);
        let hihat = this.adjustHiHat(hihatBase[beat], melodyNote, beat);

        // Add variation based on accent points
        if (accentPoints.includes(globalBeat)) {
          kick *= 1.2; // Emphasize kicks on accent points
          snare *= 0.8; // Reduce snare on accent points
        }

        pattern.push({
          kick: Math.min(1, kick),
          snare: Math.min(1, snare),
          hihat: Math.min(1, hihat),
        });
      }
    }

    return pattern;
  }

  adjustKick(baseValue, melodyNote, beat) {
    // Reduce kick if melody has low note
    if (melodyNote && melodyNote.octave < 4) {
      return baseValue * 0.7;
    }
    // Emphasize kicks on main beats
    if (beat % 4 === 0) {
      return baseValue * 1.2;
    }
    return baseValue;
  }

  adjustSnare(baseValue, melodyNote, beat) {
    // Add ghost notes during melody rests
    if (!melodyNote && beat % 4 !== 0) {
      return baseValue * 0.5;
    }
    return baseValue;
  }

  adjustHiHat(baseValue, melodyNote, beat) {
    // Vary hi-hat pattern based on melody rhythm
    if (melodyNote) {
      return baseValue * 0.8; // Slightly reduce during melody notes
    }
    return baseValue;
  }

  calculateRhythmicActivity(pattern) {
    let changes = 0;
    let lastNote = null;
    pattern.forEach((note) => {
      if ((note && !lastNote) || (!note && lastNote)) {
        changes++;
      }
      lastNote = note;
    });
    return changes / pattern.length;
  }

  findAccentPoints(pattern) {
    const accents = [];
    pattern.forEach((note, i) => {
      if (note) {
        // Check for isolated notes
        const isIsolated = !pattern[i - 1] && !pattern[i + 1];
        // Check for high notes
        const isHigh = note.octave > 4;
        // Check for longer duration
        const isLong = note.duration > 0.25;

        if (isIsolated || isHigh || isLong) {
          accents.push(i);
        }
      }
    });
    return accents;
  }
}

export class PatternCoordinator {
  constructor() {
    this.melodyGenerator = new MelodyGenerator();
    this.harmonyGenerator = new HarmonyGenerator();
    this.bassGenerator = new BassGenerator();
    this.drumGenerator = new DrumGenerator();
  }

  generateFullPattern(key, chord, measures = 2, previousPatterns = null) {
    // Generate melody first
    const melodyPattern = this.melodyGenerator.generatePattern(
      key,
      chord,
      measures,
      previousPatterns?.melody,
    );

    // Generate other patterns based on melody
    return {
      melody: melodyPattern,
      harmony: this.harmonyGenerator.generatePattern(
        key,
        chord,
        measures,
        melodyPattern,
      ),
      bass: this.bassGenerator.generatePattern(
        key,
        chord,
        measures,
        melodyPattern,
      ),
      drums: this.drumGenerator.generatePattern(measures, melodyPattern),
    };
  }
}
