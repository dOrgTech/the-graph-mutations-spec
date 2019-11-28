export default class Transaction {
    constructor(hash){
        this.hash = hash;
        this.completed = false;
        this.progress = 0;
    }
}