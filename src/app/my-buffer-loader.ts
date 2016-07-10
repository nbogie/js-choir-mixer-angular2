export class MyBufferLoader {
  urlList: string[];
  onAllLoadedFn: any; // a function
  bufferList: any[]; 
  loadCount: number = 0;
  
  constructor(private mixer: any, private context: any, urlList:string[], allLoadedFn) {
    this.urlList = urlList;
    this.bufferList = new Array(urlList.length);
    this.onAllLoadedFn = allLoadedFn;
  }


  loadOneBuffer(url, index) {

    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    let loader = this;
    request.onload = function () {
        loader.context.decodeAudioData(
            request.response, 
            (audioBuffer) => {
              console.log("one decode finished, for good or bad: "+audioBuffer);
                if (!audioBuffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = audioBuffer;
                if (++loader.loadCount == loader.urlList.length){
                    loader.onAllLoadedFn(loader.bufferList);
                }
            },
            function (error) {
                console.error('decodeAudioData error', error);
            }
        );
    };

    request.onerror = function () {
        alert('BufferLoader: XHR error');
    };

    request.send();

  }

  loadAll() {
    this.urlList.forEach((url, ix) => this.loadOneBuffer(url, ix));
  }

}
