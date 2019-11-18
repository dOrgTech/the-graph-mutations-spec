import gql from 'graphql-tag';

export const GET_TODOS_QUERY = gql`
{
    getTodos{
        id 
        description 
        asignee 
        completed
    }
}

`