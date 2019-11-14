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
        completed: Boolean!
    }
    type Query{
        getTodos: [Todo]
    }
    type Mutation{
        create(createInput: CreateInput): Todo!
        complete(id: ID!): Todo!
    }
`