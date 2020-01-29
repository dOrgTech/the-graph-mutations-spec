import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Todo{
      id: ID!
      asignee: String!
      description: String!
      completed: Boolean!
  }
  input CreateInput{
      asignee: String!
      description: String!
  }
  extend type Query{
      getTodos: [Todo]
  }
  extend type Mutation{
      create(createInput: CreateInput, requestId: ID): Todo!
      setComplete(id: ID!, requestId: ID): Todo!
      setIncomplete(id: ID!, requestId: ID): Todo!
      delete(id: ID!, requestId: ID): Todo!
  }
  extend type Subscription {
      progress(requestId: ID!): Float!
  }
  `;