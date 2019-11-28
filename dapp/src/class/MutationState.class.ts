import Transaction from './Transaction.class';
import { BehaviorSubject } from 'rxjs';
import IMutationState from '../interface/IMutationState.interface';

export default class MutationState implements IMutationState{
    private _transactions: Transaction[];
    private _observable: BehaviorSubject<MutationState>;

    constructor(observable: BehaviorSubject<MutationState>){
        this._observable = observable;
    }

    get transactions(){
        return this._transactions;
    }

    public getPendingTransactions(){
        return this._transactions.filter((transaction) => !transaction.completed )
    }

    public getCompletedTransactions(){
        return this._transactions.filter((transaction) => transaction.completed )
    }

    public findByHash(hash: string){
        return this._transactions.find((transaction) => transaction.hash === hash)
    }

    public addTransaction(transaction: Transaction){
        this._transactions.push(transaction);
    }

    public publish(){
        this._observable.next(this);
    }
}