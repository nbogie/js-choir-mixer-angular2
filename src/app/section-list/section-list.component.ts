import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Section } from '../section';

@Component({
    moduleId: module.id,
    selector: 'app-section-list',
    templateUrl: 'section-list.component.html',
    styleUrls: ['section-list.component.css']
})
export class SectionListComponent implements OnInit {

    @Input() sectionName: string;
    @Input() sections: Section[];
    @Output() jumpRequest = new EventEmitter<number>();

    constructor() { }

    ngOnInit() {
    }

    markTime() {
        console.log("marking time with title: " + this.sectionName);
        //TODO: get current time from mixer (behind an interface, perhaps) 
    }

    clickedSection(section) {
        this.jumpRequest.emit(section.time);
    }
}
