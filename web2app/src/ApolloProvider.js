import React from 'react';
import App from './App';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { generateId } from './util/IdGenerator';
import sleep from './util/sleep';


const typeDefs = gql`
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

const query = gql`
                    query GetTodos {
                        getTodos @client {
                        id
                        asignee
                        completed
                        description
                        }
                    }
                `;

const cache = new InMemoryCache();
cache.writeData({
    data: {
        getTodos: []
    }
})

const fragment = gql`
fragment completeTodo on Todo {
    completed
    id
    asignee
    description
}
`;


const client = new ApolloClient({
    resolvers: {
        Mutation: {
            create: async (_, { createInput: { asignee, description }, requestId: id }, { cache }) => {
                const previous = cache.readQuery({ query })
                const newTodo = { id: generateId(), completed: false, description, asignee, __typename: 'Todo' }
                const data = { getTodos: [...previous.getTodos, newTodo] };
                cache.writeQuery({ query, data });
                return newTodo;
            },
            delete: async (_, { id }, { cache }) => {
                const previous = cache.readQuery({ query })
                console.log(previous.getTodos)
                const element = previous.getTodos.find((todo) => todo.id === id)
                const data = { getTodos: [...previous.getTodos.filter((todo) => todo.id !== id)] }
                await sleep(5000);
                cache.writeQuery({ query, data })
                return element;
            },
            setComplete: async (_, { id }, {cache, getCacheKey}) => {
                const todoId = getCacheKey({ __typename: 'Todo', id })
                const todo = cache.readFragment({ fragment, id: todoId });
                console.log(todo)
                todo.completed = !todo.completed;
                console.log(todo)
                const data = { ...todo };
                console.log(data)
                cache.writeData({ id:todoId, data });
                return todo;
            }
        }
    },
    cache,
    typeDefs
})

export default (
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
);