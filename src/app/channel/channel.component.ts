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
  
  constructor() {}

  ngOnInit() {
  }

  play() {
      let src = this.context.createBufferSource();
      src.playbackRate.value = 1;
      src.buffer = this.channelInfo.buffer;
      src.connect(this.context.destination);
      src.start();
  }
}
