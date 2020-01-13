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

export interface MutationState {
    progress: number
    events: TransactionEvent[]
    transactions: Transaction[];
    errors: string[];
    ext?: object;
}

interface IManagedMutationState {
    startTransaction(transaction: StartedTransaction): void
    cancelTransaction(id: string, progress: number, transactionCancelData: any): void
    confirmTransaction(id: string, progress: number, transactionConfirmData: any): void
    addError(id: string, error: string): void
}

export class ManagedMutationState implements IManagedMutationState {
    public state: MutationState = {
        progress: 0,
        events: [],
        transactions: [],
        errors: []
    }
    private observable?: BehaviorSubject<MutationState>;

    constructor(observable?: BehaviorSubject<MutationState>) {
        this.observable = observable;
    }

    setEvents(events: TransactionEvent[]){
        this.state.events = events;
    }

    setProgress(progress: number){
        this.state.progress = progress;
    }

    setErrors(errors: string[]){
        this.state.errors = errors;
    }

    setTransactions(transactions: Transaction[]){
        this.state.transactions = transactions;
    }

    setExt(ext: object){
        this.state.ext = ext;
    }

    startTransaction({id, title, payload}: {id: string, title: string, payload: object}){
        const transaction = {
            id,
            title,
            payload,
            status: TransactionStatus.started
        }
        this.state.transactions.push(transaction)
        this.state.events.push({
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

        this.state.events.push({
            UTCtimestamp: new Date().getTime(),
            transaction
        })

        this.state.progress = progress;

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

        this.state.events.push({
            UTCtimestamp: new Date().getTime(),
            transaction
        })

        this.state.progress = progress;

        this.publish();
    }

    addError(id: string, error: string){
        let transaction = this.getTransaction(id);
        transaction.status = TransactionStatus.errored;
        this.state.events.push({
            UTCtimestamp: new Date().getTime(),
            transaction 
        })
        this.state.errors.push(error);
        this.publish();
    }

    private getTransaction(id: string){
        const transaction = this.state.transactions.find(transaction => transaction.id === id)
        if(!transaction) throw new Error(`Transaction with id '${id}' not found`)
        return transaction;
    }

    private publish() {
        if (this.observable) {
            this.observable.next(cloneDeep(this.state));
        }
    }
}
