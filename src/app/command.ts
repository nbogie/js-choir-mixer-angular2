export enum CmdType {
    ClearAll = 1,
    MuteSome,
    JumpTo
}
//TODO: detail types for every command - don't use data: any.
export class Command {
    type: CmdType;
    data: any;
}
