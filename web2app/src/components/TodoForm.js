import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { Button, Form, Card, Progress } from 'semantic-ui-react';
import { CREATE_TODO } from '../graphql/mutations';
import { GET_TODOS_QUERY } from '../graphql/queries';
import { NEW_TODO_SUBSCRIPTION } from '../graphql/subscriptions';
import { useForm } from '../util/hooks/form.hook';
import { notify } from 'react-notify-toast';
import { useMutationAndSubscribe } from '../graphql/hooks';
import { useMutation } from '@apollo/react-hooks';

function Create() {

    const { onChange, onSubmit, values } = useForm(createTodo, {
        asignee: '',
        description: ''
    });

    const resetForm = () => {
        values.asignee = '';
        values.description = '';
    }

    const [executeMutation] = useMutation(CREATE_TODO, {
        onError(error) {
            console.log(error)
            notify.show(
                "An unexpected error ocurred while creating ToDo",
                "error",
                4000
            )
        },
        variables: {...values, requestId: '87'}
    })

    function createTodo() {
        executeMutation();
    }

    return (
        <div>
            <Card fluid>
                <Card.Content>
                    <Form onSubmit={onSubmit}>
                        <h1>New TODO</h1>
                        <Form.Input
                            label="Asignee"
                            type="text"
                            name="asignee"
                            value={values.asignee}
                            onChange={onChange}
                        />
                        <Form.TextArea
                            label="Description"
                            type="text"
                            name="description"
                            value={values.description}
                            onChange={onChange}
                        />
                        <Button type="submit" primary>
                            Create
                </Button>
                    </Form>
                </Card.Content>
            </Card>

        </div>
    )
}

export default Create;