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

  constructor() {}

  ngOnInit() {
  }

}
