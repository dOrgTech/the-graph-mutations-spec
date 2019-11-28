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

    addTransaction(transaction){
        this.transactions.push(transaction);
    }

    findByHash(hash){
        return this.transactions.find((transaction)=> transaction.hash === hash)
    }

    publish(){
        this.observable.next(this)
    }
}