
import React from 'react'
import cloneDeep from 'lodash/cloneDeep';
import { Button } from 'semantic-ui-react'
import { useMutation } from '@apollo/react-hooks';
import { DELETE } from '../graphql/mutations';
import { GET_TODOS_QUERY } from '../graphql/queries';

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
        variables: { id: props }
    })

    return (
        <Button color='red' onClick={deleteTodo}>X</Button>
    );
}

export default DeleteButton;