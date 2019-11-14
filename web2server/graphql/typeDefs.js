const gql = require('graphql-tag');

module.exports = gql`
    type Todo{
        id: ID!
        asignee: String!
        description: String!
        completed: Boolean!
    }
    input TodoInput{
        asignee: String!
        description: String!
        completed: Boolean!
    }
    type Query{
        getTodos: [Todo]
    }
    type Mutation{
        create(todoInput: TodoInput): Todo!
    }
`