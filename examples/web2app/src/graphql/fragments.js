
import gql from 'graphql-tag';

export const completeTodo = gql`
    fragment completeTodo on Todo {
        completed
        id
        asignee
        description
    }
`;