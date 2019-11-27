import {useEffect, useState} from 'react';
import { useMutation } from '@apollo/react-hooks';
import { generateId } from '../util/IdGenerator';
import { BehaviorSubject } from 'rxjs';

const useObservable = (observable, setter, id) => {
    useEffect(() => {
        let subscription = observable.subscribe(result => {
            setter(result[id])
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
        context: {observable},
        onError,
        variables: {...variables, requestId}
    })

    useObservable(observable, setSubscriptionData, mutationId);

    return [()=>{
        setMutationId(requestId)
        executeMutation();
    }, loading, subscriptionData]
}

