const { model , Schema } = require('mongoose');

const todoSchema = new Schema({
    asignee: String,
    description: String,
    completed: Boolean
});

module.exports = model('Todo', todoSchema);