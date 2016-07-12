export enum CmdType {
    ClearAll = 1,
    MuteSome
}

export class Command {
    type: CmdType;
    data: any;
}
