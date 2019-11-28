import ITransaction from "../interface/ITransaction.interface";

export default class Transaction implements ITransaction{
    readonly hash: string;
    private _progress: number;
    private _completed: boolean;

    constructor(hash){
        this.hash = hash;
    }

    get progress(){
        return this._progress;
    }

    get completed(){
        return this._completed;
    }

    set progress(progress: number){
        this._progress = progress;
    }

    set completed(completed: boolean){
        this._completed = completed;
    }
}