import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Section } from '../section';
import { PlayTimeProvider } from '../play-time-provider';
import { DurationClockPipe } from '../duration-clock.pipe';

@Component({
    moduleId: module.id,
    selector: 'app-section-list',
    pipes: [DurationClockPipe],
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

    get sectionsSorted(): Section[] {
        let cp = this.sections.slice();
        return cp.sort((sA, sB) => { 
            let a = sA.time;
            let b = sB.time;
            
            if (a > b) { 
                return 1; 
            } else if (a == b) {
                return 0;
            }
            else { 
                return -1;
            }
        });
    }


    ngOnInit() {
    }

    markTime() {
        console.log("marking time with title: " + this.sectionName);
        //TODO: get current time from mixer (behind an interface, perhaps)
        console.log(this.playTimeProvider);
        console.log(this.playTimeProvider.currentPlayTime());
        
        this.sections.push({label: this.sectionName, time: this.playTimeProvider.currentPlayTime()});
        this.sectionName = "";           
    }

    clickedSection(section) {
        this.jumpRequest.emit(section.time);
    }
}
