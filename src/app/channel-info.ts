export class ChannelInfo {
  id: number;  
  name: string;
  buffer: AudioBuffer;

  constructor(id: number, buffer: AudioBuffer, name: string){
    this.id = id;
    this.name = name;
    this.buffer = buffer;
  }
} 

