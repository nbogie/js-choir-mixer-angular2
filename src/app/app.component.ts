import { Component } from '@angular/core';
import { MixerComponent } from './mixer';
import { HTTP_PROVIDERS } from '@angular/http';
@Component({
    moduleId: module.id,
    selector: 'app-root',
    directives: [MixerComponent],
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
    providers: [HTTP_PROVIDERS]
})
export class AppComponent {
}
