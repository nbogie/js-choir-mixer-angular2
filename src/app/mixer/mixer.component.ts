import { Component, OnInit } from '@angular/core';
import { ChannelComponent } from '../channel/';

@Component({
  moduleId: module.id,
  selector: 'app-mixer',
  directives: [ChannelComponent],
  templateUrl: 'mixer.component.html',
  styleUrls: ['mixer.component.css']
})
export class MixerComponent implements OnInit {
  channels: string[];

  constructor() {}

  ngOnInit() {
    this.channels = ["one", "two", "three"];
  }

}
