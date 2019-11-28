import {useEffect, useState} from 'react';
import { useMutation } from '@apollo/react-hooks';
import { generateId } from '../util/IdGenerator';
import { BehaviorSubject } from 'rxjs';
import MutationState from '../class/MutationState.class';

const useObservable = (observable, setter) => {
    useEffect(() => {
        let subscription = observable.subscribe(result => {
            if(result) setter(result.findByHash("86453").progress)
        })
        return () => subscription.unsubscribe();
    }, [observable, setter])
}

export const useMutationAndSubscribe = (mutation, {
    onCompleted,
    update,
    optimisticResponse,
    onError,
    variables
}) => {

    const [subscriptionData, setSubscriptionData] = useState({})

    const [observable] = useState(new BehaviorSubject(''))

    const [executeMutation, loading] = useMutation(mutation, {
        optimisticResponse,
        onCompleted,
        update,
        context: {mutationState: new MutationState(observable)},
        onError,
        variables: {...variables}
    })

    useObservable(observable, setSubscriptionData);

    return [()=>{
        executeMutation();
    }, loading, subscriptionData]
}

