import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export interface SongInfo {
    name: string;
    fullpath: string;
    root: string;
}

@Component({
    moduleId: module.id,
    selector: 'app-song-chooser',
    templateUrl: 'song-chooser.component.html',
    styleUrls: ['song-chooser.component.css']
})
export class SongChooserComponent implements OnInit {
    isHidden: boolean = false;
    @Input() selectedSongName: string;
    songNames: string[];
    songInfos: SongInfo[];
    @Output() choseSong = new EventEmitter<SongInfo>();

    private songDirsFree: string[] = ["close_to_me", "he_has_done_marvelous_things"];
    songDirs: string[] = ["deep_river", "as", "great_is_thy_faithfulness",
        "how_great_thou_art", "pretty_hurts", "motherless_child", "wayfaring_stranger",
        "get_lucky_the_few", "hymn_of_acxiom_the_few", "good_news", "africa",
        "am_i_wrong", "do_you_hear"];

    constructor() { }

    ngOnInit() {
        this.songInfos = this.getSongInfos();
        this.songNames = this.songInfos.map(si => si.name);
    }
    getSongInfos() : SongInfo[] {
        let allSongInfos = [
            { names: this.songDirsFree, root: 'sounds-free/' },
            { names: this.songDirs, root: 'sounds/' }]
            .map((obj) =>
                obj.names.map((name) =>
                    ({
                        root: obj.root,
                        name: name,
                        fullpath: (obj.root + name + "/index.json")
                    })
                ));
        return [].concat(...allSongInfos);
    }

    
    pickSong() {
        let sis = this.getSongInfos();
        let selectedSongInfo = sis.find((si) => si.name == this.selectedSongName);
        if (selectedSongInfo) {
            this.choseSong.emit(selectedSongInfo);
            this.isHidden = true;
        } else {
            //no song picked
            console.log("No (or unknown) song picked.");
        }
    }

}


