
import React from 'react'
import cloneDeep from 'lodash/cloneDeep';
import { Button } from 'semantic-ui-react'
import { useMutation } from '@apollo/react-hooks';
import { DELETE } from '../graphql/mutations';
import { GET_TODOS_QUERY } from '../graphql/queries';
import {notify} from 'react-notify-toast';

const DeleteButton = ({ props }) => {

    const [deleteTodo] = useMutation(DELETE, {
        optimisticResponse: {
            delete: {
                id: props,
                asignee: '',
                description: '',
                completed: '',
                __typename: "Todo"
            }
        },
        update(proxy, result) {
            const data = cloneDeep(proxy.readQuery({
                query: GET_TODOS_QUERY,
            }, true));

            data.getTodos = data.getTodos.filter((todo) => { return todo.id !== props });
            proxy.writeQuery({ query: GET_TODOS_QUERY, data });
        },
        onError(error){
            notify.show(
                "An unexpected error ocurred while deleting ToDo",
                "error",
                4000
            )
        },
        variables: { id: props }
    })

    return (
        <Button color='red' onClick={deleteTodo}>Delete (Optimistic)</Button>
    );
}

export default DeleteButton;