import { Component, OnInit } from '@angular/core';
import { ChannelComponent } from '../channel/';
import { BufferLoader } from '../buffer-loader';
import { SongChooserComponent, SongInfo } from '../song-chooser/';
import { SectionListComponent } from '../section-list/';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { ChannelInfo } from '../channel-info';
import { Section } from '../section';
import { FFTConfig } from '../fft-config';
import { CmdType, Command } from '../command';
import { Subject } from 'rxjs/Subject';


declare var _: any;

@Component({
    moduleId: module.id,
    selector: 'app-mixer',
    directives: [ChannelComponent, SongChooserComponent, SectionListComponent],
    templateUrl: 'mixer.component.html',
    styleUrls: ['mixer.component.css']
})
export class MixerComponent implements OnInit {
    channelInfos: ChannelInfo[];
    mixerSubject: Subject<Command> = new Subject(); //to comm with children.
    bufferLoader: BufferLoader;
    audioCtx: AudioContext;
    bufferList: AudioBuffer[];
    allLoaded: boolean = false;
    mixer: MixerComponent; //hack. remove.
    songTitle: string;
    songInfo: any; //parsed json
    sections: Section[];
    fftConfig: FFTConfig;
    shouldPlay: boolean = false;
    isDoneChoosingSong: boolean = false;
    testOsc: OscillatorNode;
    testSynth: { gainNode: GainNode, osc: OscillatorNode } = null ;
    
    constructor(private http: Http) {
    }

    ngOnInit() {
        ////TODO necessary for some browsers?
        //console.log(window.AudioContext);
        //console.log(window.webkitAudioContext);
        //window.AudioContext = window.AudioContext||window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.fftConfig = FFTConfig.simpleConfig().waveform;
    }
    
    setupTestOsc() {
        let ctx: AudioContext = this.audioCtx;
        
        let oscillator = ctx.createOscillator();
        oscillator.frequency.value = 40; 
        oscillator.type = "sine";
        let gainNode: GainNode = ctx.createGain();
        gainNode.gain.value = 0.3;        
        gainNode.connect(ctx.destination);
        oscillator.connect(gainNode);
        oscillator.start(0);
        gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        oscillator.frequency.setTargetAtTime(1760, ctx.currentTime, 0.4); 
        this.testSynth = { osc: oscillator, gainNode: gainNode };
    }

    destroyTestOsc() {
        console.log("destroy test osc");
        this.testSynth.gainNode.disconnect();
        this.testSynth.gainNode = null;
        this.testSynth.osc.stop();
        this.testSynth.osc.disconnect();
        this.testSynth.osc = null;
        this.testSynth = null;
    }

    play() {
        this.shouldPlay = true;
    }

    stop() {
        this.shouldPlay = false;
    }

    toggleTestTone() {
        if (this.testSynth) {
            this.destroyTestOsc();
        } else {
            this.setupTestOsc();
        };
    }

    clear() {
        this.mixerSubject.next({ type: CmdType.ClearAll, data: null });
    }

    randomise() {
        this.clear();
        let numToMute: number = _.random(1, this.channelInfos.length - 1);
        let channelsToMute: ChannelInfo[] = _.sample(this.channelInfos, numToMute);
        let idsToMute = channelsToMute.map(ci => ci.id);
        this.mixerSubject.next({ type: CmdType.MuteSome, data: idsToMute });
    }

    choseSong(songInfo: SongInfo) {
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
                this.bufferLoader = new BufferLoader(this, this.audioCtx, urlList, this.finishedLoadingAllBuffers);
                this.bufferLoader.loadAll();
                this.sections = json.sectionStarts || [];
                this.isDoneChoosingSong = true;
            }).
            catch(e => console.log("err: " + e));
    }

    private makeChannelInfoFromBuffer(b: AudioBuffer, ix: number): ChannelInfo {
        let ti = this.songInfo.extra.tracks[ix];
        return new ChannelInfo(ix, b, ti.name);
    }

    finishedLoadingAllBuffers(loadedAudioBufferList) {
        //hack.  we're using this.mixer because 'this' isn't set to the mixer but to the buffer loader. 
        this.mixer.bufferList = loadedAudioBufferList;

        console.log("finished loading all buffers." + this.mixer.bufferList);
        this.mixer.allLoaded = true;
        this.mixer.channelInfos = this.mixer.bufferList.map((b, ix) => this.mixer.makeChannelInfoFromBuffer(b, ix));
        //TODO: ping angular to refresh.  we've done this stuff out of zone, it seems
    }
    
    jumpRequested(time: number) {
        console.log("mixer: jump requested to ", time);
        this.mixerSubject.next({ type: CmdType.JumpTo, data: time });
    }
}
