import { Component, OnInit } from '@angular/core';
import { ChannelComponent } from '../channel/';
import { BufferLoader } from '../buffer-loader';
import { SongChooserComponent } from '../song-chooser/';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Component({
  moduleId: module.id,
  selector: 'app-mixer',
  directives: [ChannelComponent, SongChooserComponent],
  templateUrl: 'mixer.component.html',
  styleUrls: ['mixer.component.css']
})
export class MixerComponent implements OnInit {
  channels: string[];
  bufferLoader: BufferLoader;
  urlList: string[] = ["/sounds-free/close_to_me/bass.mp3", 
                       "/sounds-free/close_to_me/drums.mp3",
                       "/sounds-free/close_to_me/xylo.mp3",
                       "/sounds-free/close_to_me/brass.mp3",
                       ];
  context: any;
  bufferList: AudioBuffer[];
  allLoaded: boolean = false;
  title = "hello";
  mixer: any; //hack. remove.
  songTitle: string;

  constructor(private http: Http){}

  demoPlay() {
//    console.assert(this.bufferList != null, "bufferList should not be null");
//    console.assert(this.bufferList.length > 0, "bufferList should not be empty");
      this.bufferList.forEach(b => {
        let src = this.context.createBufferSource();
        src.playbackRate.value = 1;
        src.buffer = b;
        src.connect(this.context.destination);
        src.start();
        }
      );
  }
  choseSong(songInfo) {
    let fullPathToJSON = songInfo.fullpath;
      console.log("song chosen: " + JSON.stringify(fullPathToJSON));
      this.http.get(fullPathToJSON).
        toPromise().
        then(resp => { 
          let json = resp.json();
          this.songTitle = json.title;
        }).
        catch(e=>console.log("err: "+e));
      
      /*
    function handleJSON(response) {
        var json = response;
        gSongTitle = json.title || "Untitled";
        $("#songTitle").html(gSongTitle);
        gTrackNames = json.tracks.map(function (t) {
            return t.name;
        });
        gSectionStarts = json.sectionStarts || [];
        recreateSectionStartsInDOM();
        finishInit();
    }

    $.getJSON(chosenSongInfo.fullpath, handleJSON);
    */

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
    this.bufferLoader = new BufferLoader(this, this.context, this.urlList, this.finishedLoadingAllBuffers);
    this.bufferLoader.loadAll();
  }

}
