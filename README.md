## ToDo Web2App Playground

This project is a React-GraphQL-Apollo playground ToDo webApp to test and explore optimistic
updates using GraphQL.

Its server was developed in NodeJS with Express, GraphQL and MongoDB Cloud Atlas.

**Note: currently all operations performed on ToDo cards have a 10 second delay before
throwing an Error. This is to see the optimistic update change on the UI and its rollback
once the operation fails.**

**The above is evidenced on web2server/graphql/resolvers/todos**

### Running the application

It can be run simply by executing:

### `npm install`

and then:

### `npm run dev`

This will run a concurrent script which will run the server and the start the application

### Supported operations

It supports a list of ToDos with the following possible actions:
- Create a new one, by filling the New TODO form at the start of the ToDos list
- Delete one by pressing on the red button on the top right corner of each card
- Update one by setting it to complete. To do so, press on the mark as complete button

### Additional information and resources

https://www.apollographql.com/docs/react/performance/optimistic-ui/