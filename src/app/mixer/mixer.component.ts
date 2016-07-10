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

  constructor(){}

  finishedLoadingAllBuffers(bufferList) {
    console.log("finished loading all buffers." + bufferList);
    //gBufferList = bufferList;
    // Create three sources and play them both together.
    //createAllGainedSourcesOnBuffers(bufferList);
    //createControlsInDOM(bufferList);
    //play();
  }

  ngOnInit() {
    this.channels = ["one", "two", "three"];
    this.context = new AudioContext();

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
