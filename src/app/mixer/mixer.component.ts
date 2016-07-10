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

  ngOnInit() {
    this.channels = ["one", "two", "three"];

    this.bufferLoader = new MyBufferLoader(this.urlList);
    this.bufferLoader.loadAll();
  }

}

export class MyBufferLoader {
  context: any;  // and audio context
  urlList: string[];
  onloadFn: any; // a function
  bufferList: any[]; 
  loadCount: number = 0;
  
  constructor(urlList:string[]) {
    this.urlList = urlList;
  }


  dlog(msg) {
    console.log(msg);
  }

  loadOneBuffer(url, index) {
    this.dlog("loadOneBuffer: not implemented");
    this.loadCount++;
  }

  loadAll() {
    this.urlList.forEach((url, ix) => this.loadOneBuffer(url, ix));
  }

}
/*
BufferLoader.prototype.loadBuffer = function (url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function () {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function (buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
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
};
*/
