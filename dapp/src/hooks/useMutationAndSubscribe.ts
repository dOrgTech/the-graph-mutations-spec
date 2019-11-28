import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import generateId from '../util/IdGenerator';
import { BehaviorSubject } from 'rxjs';
import MutationState from '../class/MutationState.class';

function useObservable (observable: BehaviorSubject<MutationState>,
    setter: React.Dispatch<React.SetStateAction<MutationState>>,
    id: string){
    useEffect(() => {
        let subscription = observable.subscribe(result => {
            if (result) setter(result)
        })
        return () => subscription.unsubscribe();
    }, [observable, setter, id])
}

export default function useMutationAndSubscribe (mutation, {
    onCompleted,
    update,
    optimisticResponse,
    onError,
    variables
}){
    const requestId = generateId();

    const [mutationId, setMutationId] = useState("")

    const [subscriptionData, setSubscriptionData] = useState(new MutationState())

    const [observable] = useState(new BehaviorSubject(new MutationState()))

    const [executeMutation, loading] = useMutation(mutation, {
        optimisticResponse,
        onCompleted,
        update,
        context: { observable, mutationState: new MutationState() },
        onError,
        variables: { ...variables, requestId }
    })

    useObservable(observable, setSubscriptionData, mutationId);

    return {executeMutation: () => {
        setMutationId(requestId)
        executeMutation();
    }, loadingMutation: loading, subscriptionData}
}

