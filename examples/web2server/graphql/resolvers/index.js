const todosResolvers = require("./todos");

module.exports = {
    Query: {
        ...todosResolvers.Query
    },
    Mutation: {
        ...todosResolvers.Mutation
    },
    Subscription:{
        ...todosResolvers.Subscription
    }
}