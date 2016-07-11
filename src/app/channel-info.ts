export class ChannelInfo {  
  name: string;
  buffer: AudioBuffer;

  constructor(buffer: AudioBuffer, name: string){
    this.name = name;
    this.buffer = buffer;
  }
} 

