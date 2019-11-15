
import React, { useState, useEffect } from 'react'
import { Button } from 'semantic-ui-react'
import { useMutation } from '@apollo/react-hooks';
import { SET_COMPLETE, SET_INCOMPLETE } from '../graphql/mutations';

const CompleteButton = ({ props: {completed, id }}) => {

    console.log(completed, id)
    const [complete, setCompleted] = useState(false);

    useEffect(() => {
        if (completed) {
            setCompleted(true);
        } else {
            setCompleted(false);
        }
    }, [completed])

    const [setComplete] = useMutation(SET_COMPLETE, {
        update(proxy, result) {
            console.log(result)
        },
        variables: { id }
    })
    
    const [setIncomplete] = useMutation(SET_INCOMPLETE, {
        update(proxy, result) {
            console.log(result)
        },
        variables: { id }
    });

    const completeButton = complete ? (
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