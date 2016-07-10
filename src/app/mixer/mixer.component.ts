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
  bufferLoader: MyBufferLoader;
  urlList: string[] = ["/sounds-free/close_to_me/bass.mp3", "/sounds-free/close_to_me/drums.mp3"];
  context: any;
  bufferList: AudioBuffer[];
  allLoaded: boolean = false;
  title = "hello";

  constructor(){}

  demoPlay() {
//    console.assert(this.bufferList != null, "bufferList should not be null");
//    console.assert(this.bufferList.length > 0, "bufferList should not be empty");
  }

  finishedLoadingAllBuffers(loadedAudioBufferList) {
    //console.assert(this.title == "hello", "this.title should be 'hello'");

    this.bufferList = loadedAudioBufferList;
    this.allLoaded = true;

    console.log("finished loading all buffers." + this.bufferList);

    let buffer = this.bufferList[0];
    let src = this.context.createBufferSource();
    src.playbackRate.value = 1;
    src.buffer = buffer;
    src.connect(this.context.destination);
    src.start();

  }

  ngOnInit() {
    this.channels = ["one", "two", "three"];
    ////TODO necessary for some browsers?
    //console.log(window.AudioContext);
    //console.log(window.webkitAudioContext);
    //window.AudioContext = window.AudioContext||window.webkitAudioContext;
    this.context = new AudioContext();
    console.log("audio context is " + this.context + JSON.stringify(this.context));
    this.bufferLoader = new MyBufferLoader(this.context, this.urlList, this.finishedLoadingAllBuffers);
    this.bufferLoader.loadAll();
  }

}

export class MyBufferLoader {
  urlList: string[];
  onAllLoadedFn: any; // a function
  bufferList: any[]; 
  loadCount: number = 0;
  
  constructor(private context: any, urlList:string[], allLoadedFn) {
    this.urlList = urlList;
    this.bufferList = new Array(urlList.length);
    this.onAllLoadedFn = allLoadedFn;
  }


  loadOneBuffer(url, index) {

    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    let loader = this;
    request.onload = function () {
        loader.context.decodeAudioData(
            request.response, 
            function (audioBuffer) {
              console.log("one decode finished, for good or bad: "+audioBuffer);
                if (!audioBuffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = audioBuffer;
                if (++loader.loadCount == loader.urlList.length){
                    loader.onAllLoadedFn(loader.bufferList);
                }
            },
            function (error) {
                console.error('decodeAudioData error', error);
            }
        );
    };

    request.onerror = function () {
        alert('BufferLoader: XHR error');
    };

    request.send();

  }

  loadAll() {
    this.urlList.forEach((url, ix) => this.loadOneBuffer(url, ix));
  }

}
