import gql from 'graphql-tag';

export const completeTodo = gql`
    fragment completeTodo on Todo {
        completed
        id
        asignee
        description
    }
`;

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

export const CREATE_TODO = gql`
    mutation create(
        $asignee: String!
        $description: String!
        $requestId: ID!
    ) {
        create (
            createInput: {
                asignee: $asignee
                description: $description
            },
            requestId: $requestId
        )@client{
            id
            asignee
            description
            completed
        }
    }
`;

export const SET_COMPLETE = gql`
    mutation setComplete(
        $id: ID!
    ) {
        setComplete(id:$id) @client{
            id
            asignee
            description
            completed
        }
    }
`;

export const DELETE = gql`
    mutation delete(
        $id: ID!
    ) {
        delete(id:$id) @client{
            id
            asignee
            description
            completed
        }
    }
`;
