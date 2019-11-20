import { useMutation } from '@apollo/react-hooks';
import { generateId } from '../util/IdGenerator';

export const useCustomMutation = ({
    onCompleted,
    update,
    optimisticResponse,
    onError,
    variables,
    mutation
}) => {

    const requestId = generateId();

    const [create, loading] = useMutation(mutation, {
        optimisticResponse,
        onCompleted,
        update,
        onError,
        variables: {...variables, requestId}
    })

    return {create, requestId, loading};
}

