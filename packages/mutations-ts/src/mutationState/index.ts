import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject } from 'rxjs';

type TransactionEvent = TransactionStartedEvent | TransactionCancelledEvent | TransactionConfirmedEvent
type Transaction = StartedTransaction | ConfirmedTransaction | CancelledTransaction

enum TransactionStatus {
    confirmed = "Confirmed",
    cancelled = "Cancelled",
    started = "Started",
    errored = "Errored"
}

interface TransactionStartedEvent {
    transaction: StartedTransaction
    UTCtimestamp: number
}

interface TransactionCancelledEvent {
    transaction: CancelledTransaction
    UTCtimestamp: number
}

interface TransactionConfirmedEvent {
    transaction: ConfirmedTransaction
    UTCtimestamp: number
}

interface ConfirmedTransaction extends StartedTransaction {
    hash: string
    to: string
    value: string
}

interface CancelledTransaction extends StartedTransaction {
    hash: string
    to: string
    value: string
}

interface StartedTransaction {
    id: string
    title: string
    payload: Object
    status: TransactionStatus
}

interface MutationStateInterface {
    startTransaction(transaction: StartedTransaction): void
    cancelTransaction(id: string, progress: number, transactionCancelData: any): void
    confirmTransaction(id: string, progress: number, transactionConfirmData: any): void
    addError(id: string, error: string): void
}

export class MutationState implements MutationStateInterface {
    private _progress: number;
    private _events: TransactionEvent[];
    private _observable?: BehaviorSubject<MutationState>;
    private _transactions: Transaction[];
    private _errors: string[];

    constructor(observable?: BehaviorSubject<MutationState>) {
        this._observable = observable;
        this._events = [];
        this._progress = 0;
        this._transactions = [];
        this._errors = [];
    }

    get events() {
        return cloneDeep(this._events);
    }

    get progress() {
        return this._progress
    }

    get errors() {
        return cloneDeep(this._errors);
    }

    startTransaction({id, title, payload}: {id: string, title: string, payload: Object}){
        const transaction = {
            id,
            title,
            payload,
            status: TransactionStatus.started
        }
        this._transactions.push(transaction)
        this._events.push({
            UTCtimestamp: new Date().getTime(),
            transaction
        })

        this.publish()
    }

    confirmTransaction(id: string, progress: number, {hash, to, value}: any){
        let transaction = this.getTransaction(id);
        transaction = {
            ...transaction,
            status: TransactionStatus.confirmed,
            hash,
            to,
            value
        } as ConfirmedTransaction

        this._events.push({
            UTCtimestamp: new Date().getTime(),
            transaction
        })

        this._progress = progress;

        this.publish();
    }

    cancelTransaction(id: string, progress: number, {hash, to, value}: any){
        let transaction = this.getTransaction(id);
        transaction = {
            ...transaction,
            status: TransactionStatus.cancelled,
            hash,
            to,
            value
        } as CancelledTransaction

        this._events.push({
            UTCtimestamp: new Date().getTime(),
            transaction
        })

        this._progress = progress;

        this.publish();
    }

    addError(id: string, error: string){
        let transaction = this.getTransaction(id);
        transaction.status = TransactionStatus.errored;
        this._events.push({
            UTCtimestamp: new Date().getTime(),
            transaction 
        })
        this._errors.push(error);
        this.publish();
    }

    private getTransaction(id: string){
        const transaction = this._transactions.find(transaction => transaction.id === id)
        if(!transaction) throw new Error(`Transaction with id '${id}' not found`)
        return transaction;
    }

    private publish() {
        if (this._observable) {
            this._observable.next(this);
        }
    }
}
