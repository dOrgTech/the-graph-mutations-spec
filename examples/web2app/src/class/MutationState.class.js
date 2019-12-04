
export default class MutationState {
    
    constructor(observable){
        this.transactions = [];
        this.observable = observable
    }

    get pendingTransactions(){
        return this.transactions.filter((transaction)=> !transaction.completed);
    }

    get allTransactions(){
        return this.transactions;
    }

    get completedTransactions(){
        return this.transactions.filter((transaction)=> transaction.completed)
    }

    addTransaction(hash){
        this.transactions.push({hash, completed: false, progress: 0});
    }

    updateTxProgress(hash, value){
        let transaction = this.transactions.find((tx)=> tx.hash === hash);
        transaction.progress = value;
    }

    findByHash(hash){
        return this.transactions.find((transaction)=> transaction.hash === hash)
    }

    publish(){
        this.observable.next(this)
    }
}