
import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { SET_COMPLETE, SET_INCOMPLETE } from '../graphql/mutations';

const CompleteButton = ({ props: { id } }) => {

    let [completed, setCompleted] = useState(false);

    const [setComplete] = useMutation(SET_COMPLETE, {
        optimisticResponse: {
            setComplete: {
                id,
                asignee: '',
                description: '',
                completed: '',
                __typename: ''
            }
        },
        update(proxy, result) {
            setCompleted(true);
        },
        onError(error) {
            setCompleted(false);
        },
        variables: { id }
    })

    const [setIncomplete] = useMutation(SET_INCOMPLETE, {
        optimisticResponse: {
            setIncomplete: {
                id,
                asignee: '',
                description: '',
                completed: '',
                __typename: ''
            }
        },
        update(proxy, result) {
            setCompleted(false);
        },
        onError(error) {
            setCompleted(true);
        },
        variables: { id }
    });

    const completeButton = completed ? (
        <Button color='green' onClick={setIncomplete}>
            Completed!
            </Button>
        ) : (
            <Button basic color='green' onClick={setComplete}>
                Mark as completed
            </Button>
        )


    return completeButton;
}

export default CompleteButton;