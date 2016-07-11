import { Component, OnInit, Input } from '@angular/core';
import { ChannelInfo } from '../channel-info';
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
  fftConfig:any;
  dataArray: Uint8Array;

  constructor() {}

  ngOnInit() {

    let fftConfigs = {
      waveform: {
          type: "waveform",
          size: 1024
      },
      spectrum: {
          type: "spectrum",
          size: 128
      }
    };
    this.fftConfig = fftConfigs.waveform;
}

  play() {
      let src = this.context.createBufferSource();
      src.buffer = this.channelInfo.buffer;
      src.playbackRate.value = 1;

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


}
