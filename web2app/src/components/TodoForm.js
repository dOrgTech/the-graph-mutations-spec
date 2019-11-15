import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { Button, Form, Card } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_TODO } from '../graphql/mutations';
import { GET_TODOS_QUERY } from '../graphql/queries';
import { useForm } from '../util/hooks/form.hook';
import { generateId } from '../util/IdGenerator';

function Create() {

    const { onChange, onSubmit, values } = useForm(createTodo, {
        asignee: '',
        description: ''
    });

    const [create] = useMutation(CREATE_TODO, {
        optimisticResponse: {
            create: {
                ...values,
                completed: false,
                id: generateId(),
                __typename: "Todo"
            }
        },
        update(proxy, result) {
            const data = cloneDeep(proxy.readQuery({
                query: GET_TODOS_QUERY,
            }, true));

            data.getTodos = [...data.getTodos, result.data.create]
            proxy.writeQuery({query: GET_TODOS_QUERY, data});

            values.asignee = '';
            values.description = '';
        },
        variables: values
    })

    function createTodo() { create() }

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