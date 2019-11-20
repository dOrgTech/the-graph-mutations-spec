import gql from 'graphql-tag';

export const CREATE_TODO = gql`
    mutation create(
        $asignee: String!
        $description: String!
        $requestId: ID!
    ) {
        create(
            createInput: {
                asignee: $asignee
                description: $description
            },
            requestId: $requestId
        ){
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
        setComplete(id:$id){
            id
            asignee
            description
            completed
        }
    }
`;

export const SET_INCOMPLETE = gql`
    mutation setIncomplete(
        $id: ID!
    ) {
        setIncomplete(id:$id){
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
        delete(id:$id){
            id
            asignee
            description
            completed
        }
    }
`;