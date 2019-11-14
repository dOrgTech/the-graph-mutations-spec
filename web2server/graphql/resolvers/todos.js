const Todo = require('../../models/Todo');

module.exports = {
    Query: {
        async getTodos() {
            try {
                const todos = await Todo.find();
                return todos;
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async create(
            parent,
            {
                todoInput: { asignee, description, completed }
            },
            context,
            info
        ) {
            const newTodo = new Todo({
                asignee,
                description,
                completed
            })

            const res = await newTodo.save();

            return {
                ...res._doc,
                id: res._id
            }
        }
    }
}