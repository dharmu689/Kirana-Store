/**
 * Generates an instant, zero-latency success beep using the browser's native AudioContext.
 */
export const playBeep = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitch success
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        // short 100ms beep
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        console.warn("Audio success beep failed to play in this browser environment", e);
    }
};

/**
 * Generates an instant, zero-latency error buzz using the browser's native AudioContext.
 */
export const playErrorBeep = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // Low pitch buzz
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        // longer 300ms buzz
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.warn("Audio error beep failed to play in this browser environment", e);
    }
};
