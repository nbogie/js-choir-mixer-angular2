import { Component, OnInit } from '@angular/core';
import { ChannelComponent } from '../channel/';
import { MyBufferLoader } from '../my-buffer-loader';
import { NgZone} from '@angular/core'

@Component({
  moduleId: module.id,
  selector: 'app-mixer',
  directives: [ChannelComponent],
  templateUrl: 'mixer.component.html',
  styleUrls: ['mixer.component.css']
})
export class MixerComponent implements OnInit {
  channels: string[];
  bufferLoader: MyBufferLoader;
  urlList: string[] = ["/sounds-free/close_to_me/bass.mp3", "/sounds-free/close_to_me/drums.mp3"];
  context: any;
  bufferList: AudioBuffer[];
  allLoaded: boolean = false;
  title = "hello";
  mixer: any; //hack. remove.
  constructor(){}

  demoPlay() {
//    console.assert(this.bufferList != null, "bufferList should not be null");
//    console.assert(this.bufferList.length > 0, "bufferList should not be empty");
      let buffer = this.bufferList[0];
      let src = this.context.createBufferSource();
      src.playbackRate.value = 1;
      src.buffer = buffer;
      src.connect(this.context.destination);
      src.start();
    }

  finishedLoadingAllBuffers(loadedAudioBufferList) {
    //hack.  we're using this.mixer because 'this' isn't set to the mixer but to the buffer loader. 
    this.mixer.bufferList = loadedAudioBufferList;
    console.log("finished loading all buffers." + this.mixer.bufferList);
    this.mixer.allLoaded = true;
    //TODO: ping angular to refresh.  we've done this stuff out of zone, it seems
  }

  ngOnInit() {
    this.channels = ["one", "two", "three"];
    ////TODO necessary for some browsers?
    //console.log(window.AudioContext);
    //console.log(window.webkitAudioContext);
    //window.AudioContext = window.AudioContext||window.webkitAudioContext;
    this.context = new AudioContext();
    console.log("audio context is " + this.context + JSON.stringify(this.context));
    this.bufferLoader = new MyBufferLoader(this, this.context, this.urlList, this.finishedLoadingAllBuffers);
    this.bufferLoader.loadAll();
  }

}
