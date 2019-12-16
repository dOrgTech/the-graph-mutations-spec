
import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { SET_COMPLETE } from '../graphql/mutations';
import { notify } from 'react-notify-toast';

const CompleteButton = ({ props: { id } }) => {

    let [completed, setCompleted] = useState(false);

    const [setComplete] = useMutation(SET_COMPLETE, {
        optimisticResponse: {
            setComplete: {
                id,
                asignee: '',
                description: '',
                completed: true,
                __typename: ''
            }
        },
        update(proxy, { data }) {
            setCompleted(data.setComplete.completed)
        },
        onError(error) {
            setCompleted(!completed);
            notify.show(
                "An unexpected error ocurred while updating ToDo",
                "error",
                4000
            )
        },
        variables: { id }
    })

    const completeButton = completed ? (
        <Button color='green' onClick={setComplete}>
            Completed!
            </Button>
    ) : (<Button basic color='green' onClick={setComplete}>
        Set Complete
        </Button>)

    return completeButton;
}

export default CompleteButton;