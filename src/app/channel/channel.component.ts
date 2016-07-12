import { Component, OnInit, Input, AfterViewInit, ViewChild} from '@angular/core';
import { ChannelInfo } from '../channel-info';
import { FFTConfig, FFTType } from '../fft-config';
import { CmdType, Command } from '../command';
import { Subject } from 'rxjs/Subject';

//TODO: separate out the visualiser from the channel

@Component({
  moduleId: module.id,
  selector: 'app-channel',
  templateUrl: 'channel.component.html',
  styleUrls: ['channel.component.css']
})
export class ChannelComponent implements OnInit, AfterViewInit {

  @Input() mixerSubject: Subject<Command>;
  @Input() channelInfo: ChannelInfo;
  @Input() audioCtx: AudioContext;

  isMuted: boolean = false;
  srcNode: AudioBufferSourceNode;
  gainNode: GainNode;

  //fft stuff
  analyser: AnalyserNode;
  @Input() fftConfig:FFTConfig; 
  dataArray: Uint8Array;
  useZeroCrossing: boolean = true;
  canvasCtx:CanvasRenderingContext2D;
  @ViewChild("visCanvas") visCanvas;

  _shouldPlay: boolean;

  @Input() set shouldPlay(v: boolean) {
      if (v && !this._shouldPlay) {          
          this._shouldPlay = true;
           //TODO: not all of the inputs may yet have been set for first time! 
          this.play();
      } else {
          if (this._shouldPlay){
              this._shouldPlay = false;
              this.stop();
          }
      }
  }
  
  constructor() {}

    ngOnInit() {
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
                default:
                    console.error("Unknown CmdType: "+ event + " in subscription");
            }
        }
        );
    }


    //from this plunker: http://embed.plnkr.co/LFhOuepJrnPVlwUXmkUt/

    ngAfterViewInit() {
        let canvas = this.visCanvas.nativeElement;
        this.canvasCtx = canvas.getContext("2d");
        this.myTick();
    }

    myTick() {
        // TODO: only mixer should call requestAnimFrame, and then delegate?
        requestAnimationFrame( () => { this.myTick() });
        //TODO: don't call draw when we're not playing (unless we need to clear it, once) 
        this.drawVis();
    }


  stop() {
    //gPlayStartedTime = -1;
    //TODO: deal with not playing, or not even initialised.
    if (this.srcNode) {
        this.srcNode.stop(0);
        this.srcNode = null;//TODO: any recycling necessary to allow srcNode to be recycled
                            //gain node maybe still holding onto it, or destination...
        this.gainNode.disconnect();
    }
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
      this.setGain(1); //TODO: set it back to what the slider says it should be 
  }
  
  clear() {
      this.unmute();
      this.setGain(1);
  }

  play() {

      //TODO: deal with already playing: 
      //  * free all old nodes as necessary, 
      //  * create new ones, and 
      //  * start playing again
      //
      //TODO: have the mixer tell us to start playing at a shortly future time
      //      so that all channels start at once, regardless of any lag in event propagation.
      let src = this.audioCtx.createBufferSource();
      src.buffer = this.channelInfo.buffer;
      src.playbackRate.value = 1;
      src.loop = true;

      let gainNode = this.audioCtx.createGain();
      gainNode.gain.value = 1;
      
      src.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      //TODO: only the src node need by recreated on each play.
      //The rest just needs to be reconnected.
      let analyser = this.audioCtx.createAnalyser();
      analyser.fftSize = this.fftConfig.size;
      let bufferLength = analyser.frequencyBinCount;
      let dataArray = new Uint8Array(bufferLength);
      gainNode.connect(analyser);
      
      src.start();

      //store those elements we'll need to reference
      this.srcNode = src;
      this.gainNode = gainNode;
      this.analyser = analyser;
      this.dataArray = dataArray;          
  }
  
  volumeSliderChanged(ev) {
    console.log(`volume slider changed to ${ev.target.value}`, ev);
    console.assert(ev  && ev.target && ev.target.value && ev.target.value >= 0 && ev.target.value <= 100, "null or bad value ev.target.value");
    this.setGain(ev.target.value / 100 * 1.0);
  }

  setGain(v: number) {
    //TODO: don't allow if no gainNode or the channel is muted.
    this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
    this.gainNode.gain.value = v;
    //TODO: update slider?
  }
  
    drawVis() {
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

  private drawSpectrum(canvasCtx, scaledVals, stripeWidth:number, w:number, h:number, yOffset:number) {
    canvasCtx.globalAlpha = 0.5;

    canvasCtx.fillStyle = 'rgb(255, 0, 0)';
    scaledVals.forEach(function (v, i) {
        canvasCtx.fillRect(i * stripeWidth, h - v + yOffset, stripeWidth, v);
    });
  }

  private drawWaveform(canvasCtx, scaledVals, step:number, w:number, h:number, yOffset: number) {
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

  private drawWaveformAtZeroCrossing(canvasCtx, scaledVals, step, w, h, yOffset, zeroCross) {
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx.beginPath();

    canvasCtx.moveTo(0, scaledVals[zeroCross]);

    for (let i = zeroCross, j = 0;
        (j < w) && (i < scaledVals.length); i++, j++) {
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

  private findFirstPositiveZeroCrossing(buf, buflen) {

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

}
