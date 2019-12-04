const gql = require('graphql-tag');

module.exports = gql`
    type Todo{
        id: ID!
        asignee: String!
        description: String!
        completed: Boolean!
    }
    input CreateInput{
        asignee: String!
        description: String!
    }
    type Query{
        getTodos: [Todo]
    }
    type Mutation{
        create(createInput: CreateInput, requestId: ID): Todo!
        setComplete(id: ID!, requestId: ID): Todo!
        setIncomplete(id: ID!, requestId: ID): Todo!
        delete(id: ID!, requestId: ID): Todo!
    }
    type Subscription {
        progress(requestId: ID!): Float!
    }
`