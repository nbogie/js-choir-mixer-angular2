import { Pipe, PipeTransform } from '@angular/core';
/*
 * Format the seconds as a duration of mm:ss
 *
 * Takes no arguments.
 *
 * Usage:
 *   value | durationClock
 * Example:
 *   {{ 63 |  durationClock}}
 *   formats to: 01:03
*/
@Pipe({name: 'durationClock'})
export class DurationClockPipe implements PipeTransform {

  private pad(n){
    return ((n < 10) ? "0" : "") + n;
  }
  secToTimeString(totalSec){
    let s = Math.round(totalSec % 60);
    let m = Math.floor(totalSec / 60);
    return this.pad(m) + ":" + this.pad(s);
  }

  transform(value: number): string {
    return this.secToTimeString(value);
  }
}