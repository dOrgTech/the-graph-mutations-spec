import React from 'react';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import { useQuery } from '@apollo/react-hooks';
import { Grid } from 'semantic-ui-react';
import { GET_TODOS_QUERY } from '../graphql/queries';

function Home() {
    const { data: { getTodos: todos } = {} } = useQuery(GET_TODOS_QUERY);
    console.log(todos)
    return (
        <div style={{ marginTop: 20 }}>
            <h1>TODO APP</h1>
            <Grid columns={2}>
                <Grid.Column style={{ marginBottom: 20 }}>
                    <TodoForm></TodoForm>
                </Grid.Column>
                <Grid.Row style={{ marginTop: 20 }}>
                    {
                        todos && todos.map(todo => (
                            <Grid.Column key={todo.id} style={{ marginBottom: 20 }}>
                                <TodoCard todo={todo}></TodoCard>
                            </Grid.Column>
                        ))
                    }
                </Grid.Row>
            </Grid>
        </div>

    )
}

export default Home;