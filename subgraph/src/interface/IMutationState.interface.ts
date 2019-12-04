import ITransaction from './ITransaction.interface';

export default interface IMutationState{
    transactions: ITransaction[];
    
    getPendingTransactions(): ITransaction[];
    getCompletedTransactions(): ITransaction[];
    findByHash(hash: string): ITransaction;
    addTransaction(hash: string): void
    updateTxProgress(hash: string, value: number): void
    updateTxCompleted(hash: string, value: boolean): void
}