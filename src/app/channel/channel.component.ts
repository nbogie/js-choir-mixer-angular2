import { Component, OnInit, Input, AfterViewInit, ViewChild} from '@angular/core';
import { ChannelInfo } from '../channel-info';
import { FFTConfig, FFTType } from '../fft-config';
import { CmdType, Command } from '../command';
import { Subject } from 'rxjs/Subject';
import { PlayTimeProvider } from '../play-time-provider';
import { DurationClockPipe } from '../duration-clock.pipe';

//TODO: separate out the visualiser from the channel

@Component({
    moduleId: module.id,
    selector: 'app-channel',
    templateUrl: 'channel.component.html',
    pipes: [DurationClockPipe],
    styleUrls: ['channel.component.css']
})
export class ChannelComponent implements OnInit, AfterViewInit, PlayTimeProvider {

    @Input() mixerSubject: Subject<Command>;
    @Input() channelInfo: ChannelInfo;
    @Input() audioCtx: AudioContext;

    isMuted: boolean = false;
    srcNode: AudioBufferSourceNode;
    gainNode: GainNode;

    private _volumeSliderValue: number;
    timeLastStarted: number;
    timeLastStopped: number;
    isPlaying: boolean = false;

    //fft stuff
    analyser: AnalyserNode;
    @Input() fftConfig: FFTConfig;
    dataArray: Uint8Array;
    useZeroCrossing: boolean = true;
    canvasCtx: CanvasRenderingContext2D;
    @ViewChild("visCanvas") visCanvas;

    constructor() { }
    
    set volumeSliderValue(v:number) {
        console.log("sliderval cjanged to : " + v);
        console.assert(v >= 0 && v <= 100, "bad value: " + v);
        this._volumeSliderValue = v;
        if (this.gainNode) {
            this.setGain(this.computeGainFromSliderAndMuteStates());
        }
    }
    get volumeSliderValue() {
        return this._volumeSliderValue;
    }
    
    //TODO: consider muting, soloing, too.
    computeGainFromSliderAndMuteStates() {
        if (this.isMuted) {
            return 0; 
        } else {
            return 1.0 * this._volumeSliderValue / 100;
        }
    }


    ngOnInit() {    
        this._volumeSliderValue = 100;    
        this.mixerSubject.subscribe(cmd => {
            switch (cmd.type) {
                case CmdType.ClearAll:
                    this.clear();
                    break;
                case CmdType.MuteSome:
                    console.assert(cmd.data, "cmd.data should not be null");
                    if (cmd.data.indexOf(this.channelInfo.id) >= 0) {
                        this.mute();
                    }
                    break;
                case CmdType.JumpTo:
                    console.assert(cmd.data, "cmd.data should not be null");
                    let time: number = cmd.data;
                    this.play(time);
                    break;
                default:
                    console.error("Unknown CmdType: " + event + " in subscription");
            }
        }
        );
    }


    //from this plunker: http://embed.plnkr.co/LFhOuepJrnPVlwUXmkUt/
    //we get an ElementRef to canvas via a ViewChild, and get the context.
    ngAfterViewInit() {
        let canvas = this.visCanvas.nativeElement;
        this.canvasCtx = canvas.getContext("2d");
        this.myTick();
    }

    myTick() {
        // TODO: don't call draw when we're not playing (unless we need to clear it, once)

        // TODO: only mixer should call requestAnimFrame, and then tell children to draw?
        requestAnimationFrame(() => { this.myTick() });
        this.drawVis();
    }


    stop() {
        //gPlayStartedTime = -1;
        //TODO: deal with not playing, or not even initialised.
        //Do we need to hold onto the source node for a while after asking it to stop?        
        if (this.srcNode) {
            this.srcNode.stop(0);
            this.srcNode = null; //TODO: any recycling necessary to allow srcNode to be recycled
            //gain node maybe still holding onto it, or destination...
            this.gainNode.disconnect();
            this.timeLastStopped = this.audioCtx.currentTime;
        } else {
            this.timeLastStopped = null;
            this.timeLastStarted = null;
        }
        this.isPlaying = false;
    }

    muteButtonClicked() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.mute();
        } else {
            this.unmute();
        }
    }

    soloButtonClicked() {
        console.error("NOT IMPLEMENTED: channel#soloButtonClicked()");
    }

    mute() {
        this.isMuted = true;
        this.setGain(0);
    }

    unmute() {
        this.isMuted = false;
        this.setGain(this.computeGainFromSliderAndMuteStates()); 
    }

    clear() {
        this.unmute();
        this.setGain(1);
    }

    cleanUpExistingNodes() {
        if (this.srcNode) {
            this.srcNode.stop(0);
            this.srcNode.disconnect();
            this.srcNode = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }
        if (this.dataArray) {
            this.dataArray = null;
        }
    }

    play(timeOffset = 0) {
        console.assert(timeOffset >= 0, "timeOffset must be non-negative");
        //visualiser may be trying to draw the analyser while this is happening!
        this.cleanUpExistingNodes();  
        //TODO: deal with already playing: 
        //  * stop src (if playing) and free all old nodes as necessary, 
        //  * create new ones, and 
        //  * start playing again
        // DON'T release references to nodes which are still running!
        
        //TODO: have the mixer tell us to start playing at a shortly future time
        //      so that all channels start at once, regardless of any lag in event propagation.
        let src = this.audioCtx.createBufferSource();
        src.buffer = this.channelInfo.buffer;
        src.playbackRate.value = 1;
        src.loop = true;

        let gainNode = this.audioCtx.createGain();
        gainNode.gain.value = this.computeGainFromSliderAndMuteStates();

        src.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        //TODO: only the src node need by recreated on each play.
        //The rest just needs to be reconnected.
        let analyser = this.audioCtx.createAnalyser();
        analyser.fftSize = this.fftConfig.size;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        gainNode.connect(analyser);
        //TODO: protect against times outwith the duration of the buffer
        src.start(0, timeOffset);
        
        this.isPlaying = true;
        this.timeLastStarted = this.audioCtx.currentTime;
        //store those elements we'll need to reference
        this.srcNode = src;
        this.gainNode = gainNode;
        this.analyser = analyser;
        this.dataArray = dataArray;
    }

    setGain(v: number) {
        //TODO: don't allow if no gainNode or the channel is muted.
        this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
        this.gainNode.gain.value = v;
        //TODO: update slider?
    }

    lengthOfBufferInSeconds() {
        //TODO: protect against uninitialised state
        return this.srcNode.buffer.duration;
    }

    drawVis() {
        if (!this.analyser) {
            //perhaps the analyser node is currently being replaced, or we're stopped.
            return; 
        }

        let canvasCtx = this.canvasCtx;

        let canvasHeight = this.visCanvas.nativeElement.height;
        let canvasWidth = this.visCanvas.nativeElement.width;

        let yOffset = 0;

        //  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasCtx.fillStyle = 'white';
        canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        if (this.fftConfig.type == FFTType.Spectrum) {
            this.analyser.getByteFrequencyData(this.dataArray);
        } else {
            this.analyser.getByteTimeDomainData(this.dataArray);
        }

        let len = this.dataArray.length;
        let stripeWidth = canvasWidth / len;
        let vertScale = canvasHeight / 256;
        let scaledVals = this.dataArray.map(v => v * vertScale);

        if (this.fftConfig.type == FFTType.Spectrum) {
            this.drawSpectrum(canvasCtx, scaledVals, stripeWidth, canvasWidth, canvasHeight, yOffset);
        } else if (this.fftConfig.type == FFTType.Waveform) {
            if (this.signalAboveThreshold(this.dataArray)) {
                if (this.useZeroCrossing) {
                    let zeroCross = this.findFirstPositiveZeroCrossing(this.dataArray, canvasWidth);
                    this.drawWaveformAtZeroCrossing(canvasCtx, scaledVals, stripeWidth, canvasWidth, canvasHeight, yOffset, zeroCross);
                } else {
                    this.drawWaveform(canvasCtx, scaledVals, stripeWidth, canvasWidth, canvasHeight, yOffset);
                }
            }
        } else {
            console.error("ERROR: Unknown FFTType: " + this.fftConfig.type);
        }
    }

    private drawSpectrum(canvasCtx, scaledVals: Uint8Array, stripeWidth: number, w: number, h: number, yOffset: number) {
        canvasCtx.globalAlpha = 0.5;

        canvasCtx.fillStyle = 'rgb(255, 0, 0)';
        scaledVals.forEach(function (v, i) {
            canvasCtx.fillRect(i * stripeWidth, h - v + yOffset, stripeWidth, v);
        });
    }

    private drawWaveform(canvasCtx, scaledVals: Uint8Array, step: number, w: number, h: number, yOffset: number) {
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();
        let x: number = 0;

        scaledVals.forEach(function (v, i) {
            let y = v + yOffset;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += step;
        });
        canvasCtx.stroke();
    }

    private drawWaveformAtZeroCrossing(canvasCtx, scaledVals: Uint8Array, step, w, h, yOffset, zeroCross: number) {
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();

        canvasCtx.moveTo(0, scaledVals[zeroCross]);

        for (let i = zeroCross, j = 0;
            (j < w) && (i < scaledVals.length); i++ , j++) {
            canvasCtx.lineTo(j, (scaledVals[i]));
        }

        canvasCtx.stroke();
    }


    private signalAboveThreshold(arr: Uint8Array): boolean {
        let threshold = 3;
        //TODO: document here what the range of val could be, 
        //and check the math 
        return ((typeof arr.find(val => (Math.abs(128 - val) > threshold))) !== 'undefined');
    }

    private findFirstPositiveZeroCrossing(buf: Uint8Array, buflen: number): number {

        let MINVAL = 134; // 128 == zero.  MINVAL is the "minimum detected signal" level.

        let i = 0;
        let last_zero = -1;
        let t;

        // advance until we're zero or negative
        while (i < buflen && (buf[i] > 128)) {
            i++;
        }

        if (i >= buflen) {
            return 0;
        }
        // advance until we're above MINVAL, keeping track of last zero.
        while (i < buflen && ((t = buf[i]) < MINVAL)) {
            if (t >= 128) {
                if (last_zero === -1) {
                    last_zero = i;
                }
            } else {
                last_zero = -1;
            }
            i++;
        }

        // we may have jumped over MINVAL in one sample.
        if (last_zero === -1) {
            last_zero = i;
        }

        if (i == buflen) { // We didn't find any positive zero crossings
            return 0;
        }

        // The first sample might be a zero.  If so, return it.
        if (last_zero === 0) {
            return 0;
        }

        return last_zero;
    }
    duration() {
        return this.channelInfo.buffer.duration;
    }
    
    changePlayPosition(frac) {
        let intendedPos = frac * this.duration();
        this.play(intendedPos);
    }

    //return time in seconds of where we are in the loop.
    //when a channel loops the time should count up from 0sec again.
    currentPlayTime() {
        if (this.isPlaying) {
            //TODO: consider also that we may not have started at the start
            //TODO: consider we may not have been playing back at 1.0x speed.
            return (this.audioCtx.currentTime - this.timeLastStarted) % this.channelInfo.buffer.duration;
        } else {
            if (this.timeLastStopped) {
                return this.timeLastStopped - this.timeLastStarted;
            } else {
                return 0;  //never been stopped, and not currently playing.
            }             
        }
    }
}
