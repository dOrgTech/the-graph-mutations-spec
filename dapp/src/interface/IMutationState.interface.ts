import ITransaction from './ITransaction.interface';

export default interface IMutationState{
    transactions: ITransaction[];
    
    getPendingTransactions(): ITransaction[];
    getCompletedTransactions(): ITransaction[];
    findByHash(hash: string): ITransaction;
    addTransaction(transaction: ITransaction): void
    publish(): void
}