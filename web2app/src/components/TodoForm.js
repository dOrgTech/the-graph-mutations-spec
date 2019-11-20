import React, { useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { Button, Form, Card, Progress } from 'semantic-ui-react';
import { useSubscription } from '@apollo/react-hooks';
import { CREATE_TODO } from '../graphql/mutations';
import { GET_TODOS_QUERY } from '../graphql/queries';
import { NEW_TODO_SUBSCRIPTION } from '../graphql/subscriptions';
import { useForm } from '../util/hooks/form.hook';
import { notify } from 'react-notify-toast';
import { useCustomMutation } from '../graphql/hooks';

function Create() {

    const { onChange, onSubmit, values } = useForm(createTodo, {
        asignee: '',
        description: ''
    });

    const resetForm = () => {
        values.asignee = '';
        values.description = '';
    }

    const [requestId, setRequestId] = useState(0);

    const { create, requestId: mutationId, loading: { loading } } = useCustomMutation({
        mutation: CREATE_TODO,
        update(proxy, result) {
            const data = cloneDeep(proxy.readQuery({
                query: GET_TODOS_QUERY,
            }, true));

            data.getTodos = [...data.getTodos, result.data.create]
            proxy.writeQuery({ query: GET_TODOS_QUERY, data });

            resetForm();
        },
        onError(error) {
            notify.show(
                "An unexpected error ocurred while creating ToDo",
                "error",
                4000
            )
        },
        variables: values
    })

    const { data: { progress } = {} } = useSubscription(
        NEW_TODO_SUBSCRIPTION,
        { variables: { requestId } }
    );

    function createTodo() {
        create();
        setRequestId(mutationId);
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
                        <Button type="submit" primary disabled={loading}>
                            Create
                </Button>
                    </Form>
                </Card.Content>
            </Card>

            {loading ?
                (<div>
                    <p>Executing transaction... </p>
                    <Progress percent={progress} indicating />
                </div>)
                : ''}

        </div>
    )
}

export default Create;