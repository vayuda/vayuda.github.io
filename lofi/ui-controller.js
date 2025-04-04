export class UIController {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.bindEvents();
    }

    bindEvents() {
        // Play/Pause button
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            const btn = document.getElementById('playPauseBtn');
            if (this.audioEngine.isPlaying) {
                this.audioEngine.pause();
                btn.textContent = 'Play';
            } else {
                this.audioEngine.play();
                btn.textContent = 'Pause';
            }
        });

        // Skip button
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.audioEngine.skipToNext();
        });

        // Volume controls
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.audioEngine.setMasterVolume(e.target.value / 100);
        });

        // Track volume controls
        ['melody', 'harmony', 'bass', 'drums'].forEach(trackId => {
            const slider = document.getElementById(`${trackId}Volume`);
            const muteBtn = document.getElementById(`${trackId}Mute`);

            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.audioEngine.setTrackVolume(trackId, e.target.value / 100);
                });
            }

            if (muteBtn) {
                muteBtn.addEventListener('click', () => {
                    if (muteBtn.classList.contains('muted')) {
                        this.audioEngine.unmuteTrack(trackId);
                        muteBtn.classList.remove('muted');
                    } else {
                        this.audioEngine.muteTrack(trackId);
                        muteBtn.classList.add('muted');
                    }
                });
            }
        });
    }
}