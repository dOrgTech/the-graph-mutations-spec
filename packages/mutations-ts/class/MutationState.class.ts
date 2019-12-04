import { ITransaction } from '../interface/ITransaction.interface';
import { BehaviorSubject } from 'rxjs';
import IMutationState from '../interface/IMutationState.interface';
import cloneDeep from 'lodash/cloneDeep';

export class MutationState implements IMutationState {
    private _transactions: ITransaction[];
    private _observable: BehaviorSubject<MutationState>;

    constructor(observable: BehaviorSubject<MutationState>) {
        this._observable = observable;
    }

    get transactions() {
        return cloneDeep(this._transactions);
    }

    public getPendingTransactions() {
        return cloneDeep(this._transactions.filter((transaction) => !transaction.completed));
    }

    public getCompletedTransactions() {
        return cloneDeep(this._transactions.filter((transaction) => transaction.completed));
    }

    public findByHash(hash: string) {
        return cloneDeep(this.getByHash(hash));
    }

    public addTransaction(hash: string) {
        this._transactions.push({ hash, completed: false, progress: 0 });
        this.publish();
    }

    public updateTxProgress(hash: string, value: number) {
        let transaction = this.getByHash(hash);
        transaction.progress = value;
        if (transaction.progress === 100) transaction.completed = true;
        this.publish();
    }

    public updateTxCompleted(hash: string, value: boolean) {
        let transaction = this.getByHash(hash);
        transaction.completed = value;
        this.publish();
    }

    private publish() {
        this._observable.next(this);
    }

    private getByHash(hash: string) {
        return this._transactions.find((transaction) => transaction.hash === hash)
    }
}