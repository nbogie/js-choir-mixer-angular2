import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { ChannelInfo } from '../channel-info';
import { FFTConfig, FFTType } from '../fft-config';

//TODO: separate out the visualiser from the channel

@Component({
  moduleId: module.id,
  selector: 'app-channel',
  templateUrl: 'channel.component.html',
  styleUrls: ['channel.component.css']
})
export class ChannelComponent implements OnInit {
  
  @Input() channelInfo: ChannelInfo;
  @Input() context: AudioContext;
  isMuted: boolean = false;
  srcNode: AudioNode;
  gainNode: GainNode;

  //fft stuff
  analyser: any;
  @Input() fftConfig:FFTConfig; 
  dataArray: Uint8Array;
  canvasElem: any; //ElementRef?  height, width, getContext() don't exist on ElementRef, but on canvas...
  useZeroCrossing: boolean;

  _shouldPlay: boolean;

  @Input() set shouldPlay(v: boolean) {
      if (v && !this._shouldPlay) {          
          this._shouldPlay = true;
           //TODO: not all of the inputs may yet have been set for first time! 
          this.play();
      } else {
          if (this._shouldPlay){
              this._shouldPlay = false;
              //todo: stop
          }
      }
  }
  
  constructor() {
    console.log("channel ctor");
  }

  ngOnInit() {
  }

  play() {
      let src = this.context.createBufferSource();
      src.buffer = this.channelInfo.buffer;
      src.playbackRate.value = 1;
      src.loop = true;

      let gainNode = this.context.createGain();
      gainNode.gain.value = 1;
      
      src.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      //TODO: only the src node need by recreated on each play.
      //The rest just needs to be reconnected.
      let analyser = this.context.createAnalyser();
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

  setGain(v: number) {
    this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
    this.gainNode.gain.value = v;
    //TODO: update slider?
  }
  
  drawVis() {
      let canvasCtx = this.canvasElem.getContext('2d');
      let canvasHeight = this.canvasElem.height;
      let canvasWidth = this.canvasElem.width;

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
      let scaledVals = this.dataArray.map(v => scaledVals.push(v * vertScale))

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
