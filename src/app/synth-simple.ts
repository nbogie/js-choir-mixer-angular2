export class SynthSimple {
    protected  gainNode: GainNode;
    protected osc: OscillatorNode;

    constructor(private ctx: AudioContext) { }

    togglePlay(): boolean {
        if (this.osc) {
            this.stop();
            return false;
        } else {
            this.play();
            return true;
        }
    }

    play() {
        if (!this.osc) {

            let ctx = this.ctx;
            let oscillator: OscillatorNode = ctx.createOscillator();

            oscillator.frequency.value = 40;
            oscillator.type = "sine";

            let gainNode: GainNode = ctx.createGain();
            gainNode.gain.value = 0.3;
            gainNode.connect(ctx.destination);
            oscillator.connect(gainNode);
            oscillator.start(0);
            gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
            oscillator.frequency.setTargetAtTime(1760, ctx.currentTime, 0.4);
            this.osc = oscillator;
            this.gainNode = gainNode;
        }

    }

    stop() {
        if (this.osc) {
            this.gainNode.disconnect();
            this.gainNode = null;
            this.osc.stop();
            this.osc.disconnect();
            this.osc = null;
        }
    }
}