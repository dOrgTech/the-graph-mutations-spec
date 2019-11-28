import {useEffect, useState} from 'react';
import { useMutation } from '@apollo/react-hooks';
import { generateId } from '../util/IdGenerator';
import { BehaviorSubject } from 'rxjs';
import MutationState from '../class/MutationState.class';

const useObservable = (observable, setter, id) => {
    useEffect(() => {
        let subscription = observable.subscribe(result => {
            if(result) setter(result.findByHash("86453").progress)
        })
        return () => subscription.unsubscribe();
    }, [observable, setter, id])
}

export const useMutationAndSubscribe = (mutation, {
    onCompleted,
    update,
    optimisticResponse,
    onError,
    variables
}) => {

    const requestId = generateId();

    const [mutationId, setMutationId] = useState(0)

    const [subscriptionData, setSubscriptionData] = useState({})

    const [observable] = useState(new BehaviorSubject(''))

    const [executeMutation, loading] = useMutation(mutation, {
        optimisticResponse,
        onCompleted,
        update,
        context: {observable, mutationState: new MutationState()},
        onError,
        variables: {...variables, requestId}
    })

    useObservable(observable, setSubscriptionData, mutationId);

    return [()=>{
        setMutationId(requestId)
        executeMutation();
    }, loading, subscriptionData]
}

