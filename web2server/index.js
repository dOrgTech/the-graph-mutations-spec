const {ApolloServer} = require('apollo-server');
const gql = require('graphql-tag')
const mongoose = require('mongoose');
const {MONGODB}= require('./config');

const Todo = require('./models/Todo');

const typeDefs = gql`
    type Todo{
        id: ID!
        asignee: String!
        description: String!
        completed: Boolean!
    }
    type Query{
        getTodos: [Todo]
    }
`
const resolvers = {
    Query: {
        async getTodos(){
            try{
                const todos = await Todo.find();
                return todos;
            }catch(err) {
                throw new Error(err);
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

mongoose.connect(MONGODB, { useNewUrlParser: true })
    .then(()=>{
        return server.listen({port: 5000});
    })
    .then(res => {console.log(`Server running at ${res.url}`)});