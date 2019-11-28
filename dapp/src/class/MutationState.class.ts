import Transaction from './Transaction.class';

export default class MutationState{
    private _transactions: Transaction[];

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
}