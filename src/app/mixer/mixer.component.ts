import { Component, OnInit } from '@angular/core';
import { ChannelComponent } from '../channel/';
import { BufferLoader } from '../buffer-loader';
import { SongChooserComponent } from '../song-chooser/';
import { SectionListComponent } from '../section-list/';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { ChannelInfo } from '../channel-info';
import { Section } from '../section';
import { FFTConfig } from '../fft-config';

@Component({
  moduleId: module.id,
  selector: 'app-mixer',
  directives: [ChannelComponent, SongChooserComponent, SectionListComponent],
  templateUrl: 'mixer.component.html',
  styleUrls: ['mixer.component.css']
})
export class MixerComponent implements OnInit {
  channelInfos: ChannelInfo[];
  bufferLoader: BufferLoader;
  context: any;
  bufferList: AudioBuffer[];
  allLoaded: boolean = false;
  mixer: any; //hack. remove.
  songTitle: string;
  songInfo: any; //parsed json
  sections: Section[];
  fftConfig: FFTConfig;
  shouldPlay: boolean = false;

  that = this;

  constructor(private http: Http){
  }

  ngOnInit() {
    ////TODO necessary for some browsers?
    //console.log(window.AudioContext);
    //console.log(window.webkitAudioContext);
    //window.AudioContext = window.AudioContext||window.webkitAudioContext;
    this.context = new AudioContext();
    this.fftConfig = FFTConfig.simpleConfig().waveform;
  }

  play() {
    this.shouldPlay = true;
  }
  
  stop() {
    this.shouldPlay = false;
  }
  
  clear() {
    console.log("todo: clear mix");
  }

  randomise() {
    console.log("todo: randomise mix");
  }

  choseSong(songInfo) {
    this.songInfo = songInfo;
    let fullPathToJSON = songInfo.fullpath;
    console.log("song chosen: " + JSON.stringify(fullPathToJSON));
    this.http.get(fullPathToJSON).
        toPromise().
        then(resp => { 
          let json = resp.json();
          this.songTitle = json.title;
          this.songInfo.extra = json;
          let urlList = json.tracks.map(t => `${songInfo.root}${songInfo.name}/${t.name}`);
          this.bufferLoader = new BufferLoader(this, this.context, urlList, this.finishedLoadingAllBuffers);
          this.bufferLoader.loadAll();
          this.sections = json.sectionStarts || [];
        }).
        catch(e=>console.log("err: "+e));
      
  }

  private makeChannelInfoFromBuffer(b:AudioBuffer, ix:number):ChannelInfo{
    console.log("ix is: "+ix);
    let ti = this.songInfo.extra.tracks[ix];
    console.log("track name ix is " + JSON.stringify(ti));
    return new ChannelInfo( b, ti.name );
  }

  finishedLoadingAllBuffers(loadedAudioBufferList) {
    //hack.  we're using this.mixer because 'this' isn't set to the mixer but to the buffer loader. 
    this.mixer.bufferList = loadedAudioBufferList;
    
    console.log("finished loading all buffers." + this.mixer.bufferList);
    this.mixer.allLoaded = true;
    this.mixer.channelInfos = this.mixer.bufferList.map((b, ix) => this.mixer.makeChannelInfoFromBuffer(b, ix));
    //TODO: ping angular to refresh.  we've done this stuff out of zone, it seems
  }

}
