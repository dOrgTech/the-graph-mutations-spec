import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { BehaviorSubject } from 'rxjs';
import { MutationState } from '@graphmutations/mutations-ts';

function useObservable(observable: BehaviorSubject<MutationState>, setter: React.Dispatch<React.SetStateAction<MutationState>>) {
    useEffect(() => {
        let subscription = observable.subscribe(result => {
            if (result) setter(result)
        })
        return () => subscription.unsubscribe();
    }, [observable, setter])
}

export default function useMutationAndSubscribe(mutation, {
    onCompleted,
    update,
    optimisticResponse,
    onError,
    variables
}) {
    const [subscriptionData, setSubscriptionData] = useState({} as MutationState)

    const [observable] = useState(new BehaviorSubject({} as MutationState))

    const [executeMutation, loading] = useMutation(mutation, {
        optimisticResponse,
        onCompleted,
        update,
        context: { mutationState: new MutationState(observable) },
        onError,
        variables: { ...variables }
    })

    useObservable(observable, setSubscriptionData);

    return {
        executeMutation: () => {
            executeMutation();
        },
        loadingMutation: loading,
        subscriptionData
    }
}

