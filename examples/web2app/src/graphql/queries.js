import gql from 'graphql-tag';

export const GET_TODOS_QUERY = gql`
query GetTodos {
        getTodos @client {
            id
            asignee
            completed
            description
        }
    }

`