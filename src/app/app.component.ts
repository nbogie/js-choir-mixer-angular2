import { Component } from '@angular/core';
import { MixerComponent } from './mixer';
@Component({
  moduleId: module.id,
  selector: 'app-root',
  directives: [MixerComponent],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent {
}
