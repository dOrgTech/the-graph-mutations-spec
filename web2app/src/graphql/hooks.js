import { useMutation, useSubscription } from '@apollo/react-hooks';
import { generateId } from '../util/IdGenerator';
import {useState} from 'react';

export const useMutationAndSubscribe = (mutation, subscription, {
    onCompleted,
    update,
    optimisticResponse,
    onError,
    variables
}) => {

    const [mutationId, setMutationId] = useState(0);

    const requestId = generateId();

    const [executeMutation, loading] = useMutation(mutation, {
        optimisticResponse,
        onCompleted,
        update,
        onError,
        variables: {...variables, requestId}
    })

    const { data: { progress } = {} } = useSubscription(
        subscription,
        { variables: { requestId: mutationId } }
      );

    return {executeMutation: ()=>{
        setMutationId(requestId)
        executeMutation();
    }, loading, progress}
}

