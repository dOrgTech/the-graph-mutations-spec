import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { BehaviorSubject } from 'rxjs';
import { MutationState } from '@graphprotocol/mutations-ts/dist';

function useObservable(observable: BehaviorSubject<MutationState>, setter: React.Dispatch<React.SetStateAction<MutationState>>) {
    useEffect(() => {
        let subscription = observable.subscribe(result => {
            if (result) setter(result)
        })
        return () => subscription.unsubscribe();
    }, [observable, setter])
}

export function useMutationAndSubscribe(mutation: any, mutationOptions: any) {
    const [subscriptionData, setSubscriptionData] = useState({} as MutationState)

    const [observable] = useState(new BehaviorSubject({} as MutationState))

    mutationOptions.context = {
        ...mutationOptions.context,
        mutationState: new MutationState(observable)
    }

    const [executeMutation, loading] = useMutation(mutation, mutationOptions)

    useObservable(observable, setSubscriptionData);

    return {
        executeMutation: () => {
            executeMutation();
        },
        loadingMutation: loading,
        subscriptionData
    }
}

