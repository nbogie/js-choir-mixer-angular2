# TODO list


* solo buttons for each part (radio button?)

* Advance the position slider while the piece plays?

### DONE:

* re-apply mute-button states to sources once they've been re-created (e.g. on seek, pause, etc)

* make a list of positions.

* click snapshot position to jump to that position

* add buttons to randomize mix, and clear-mix (clears mute and solo selections).

# OLD TODO (from jquery impl)

* Implement import and export of section start times file.

* keyboard shortcuts:
    Space to toggle play.
    left, right arrows to start and prev or next song point. 
    up, down arrows to solo prev or next track, restarting playback at last selected section.
    
* Time readout: When tracks are looping, time readout should loop, too.  Currently, it continues incrementing after the loop point.

* Waveform display: consider using averaging to smooth waveforms

* Waveform display, best lock: have waveform vis first look for first positive zero crossing, to try to keep a more stable window onto the waveform each frame.  e.g. http://webaudiodemos.appspot.com/oscilloscope/index.html

* Distortion: drop the overall gain when as more tracks are added.

* If playing, changes to the position slider immediately play at that point.

* Memory leaks: be sure that no intended-to-be-deleted nodes are being held onto through the lifetime of the app, e.g. referenced elsewhere.

* Add a radix of 10 to calls to parseInt, to prevent leading zeros on numbers changing their base for interpretation.

* Warn when files are different durations that they will (probably) not loop correctly.

### Issues relating to controls when stopped:

* don't dispose of the graph on stop() (at most, get rid of the buffersource nodes).  This will allow volume sliders and mute buttons to when nothing is playing.

* volume changes on muted tracks should consult track mute state and only affect track gain if not muted.  

* on creation/play, sync not only with mute states but volume sliders.

* allow mute buttons to be changed even when the gain nodes they affect are stale or non-existent.

* when pressing stop multiple times, don't replace perfectly good source nodes.  Consult isPlaying.

* Don't error when moving position position slider when stopped.  Prevent slider moving, if necessary.

Maybe:
=======

* allow track streaming from soundcloud, and auto-load multiple tracks from there if a numbering scheme is detected. ("Foosong - 1 - tenor", "Foosong - 2 - alto", "Foosong - 3 - soprano")

