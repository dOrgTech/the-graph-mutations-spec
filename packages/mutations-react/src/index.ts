import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { BehaviorSubject } from 'rxjs';
import { MutationState } from '@graphprotocol/mutations-ts'

function useObservable<CustomMutationStateType>(observable: BehaviorSubject<CustomMutationStateType>,
    setter: React.Dispatch<React.SetStateAction<CustomMutationStateType>>) {
         
    useEffect(() => {
        let subscription = observable.subscribe(result => {
            if (result) setter(result)
        })
        return () => subscription.unsubscribe();
    }, [observable, setter])
}

export function useMutationAndSubscribe<CustomMutationStateType>(mutation: any,
    mutationOptions: any,
    CustomMutationState: new (observable: BehaviorSubject<CustomMutationStateType>) => CustomMutationStateType) {

    const [subscriptionData, setSubscriptionData] = useState({} as CustomMutationStateType)

    const [observable] = useState(new BehaviorSubject({} as CustomMutationStateType))

    mutationOptions.context = {
        ...mutationOptions.context,
        mutationState: new CustomMutationState(observable)
    }

    const [executeMutation, loading] = useMutation(mutation, mutationOptions)

    useObservable<CustomMutationStateType>(observable, setSubscriptionData);

    return {
        executeMutation: () => {
            executeMutation();
        },
        loadingMutation: loading,
        subscriptionData
    }
}

