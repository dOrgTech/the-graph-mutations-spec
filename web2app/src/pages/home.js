import React from 'react';
import TodoCard from '../components/TodoCard';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Grid } from 'semantic-ui-react';

function Home() {
    const { data: { getTodos: todos } } = useQuery(GET_TODOS_QUERY);
    return (
        <div>
            <Grid columns={3} divided>
                <Grid.Row>
                    {todos && todos.map(todo => (
                        <Grid.Column key={todo.id} style={{margin: 20}}>
                            <TodoCard>
                            </TodoCard>
                        </Grid.Column>
                    ))}
                </Grid.Row>
            </Grid>
        </div>

    )
}

const GET_TODOS_QUERY = gql`
{
    getTodos{
        id 
        description 
        asignee 
        completed
    }
}

`

export default Home;