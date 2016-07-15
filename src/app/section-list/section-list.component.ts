import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Section } from '../section';
import { PlayTimeProvider } from '../play-time-provider';

@Component({
    moduleId: module.id,
    selector: 'app-section-list',
    templateUrl: 'section-list.component.html',
    styleUrls: ['section-list.component.css']
})
export class SectionListComponent implements OnInit {

    @Input() sectionName: string;
    @Input() sections: Section[];
    @Input() playTimeProvider: PlayTimeProvider;
    //PlayTimeProvider;
    @Output() jumpRequest = new EventEmitter<number>();
    
    constructor() { }

    ngOnInit() {
    }

    markTime() {
        console.log("marking time with title: " + this.sectionName);
        //TODO: get current time from mixer (behind an interface, perhaps)
        console.log(this.playTimeProvider);
        console.log(this.playTimeProvider.currentPlayTime());
        
        this.sections.push({label: this.sectionName, time: this.playTimeProvider.currentPlayTime()});           
    }

    clickedSection(section) {
        this.jumpRequest.emit(section.time);
    }
}
