/*
useMutation Test
  1. verify state is working properly
  How?
    - setup client with local resolvers
    - local resolver would dispatch state updates
      - +verify context
    - create render loop for X amounts of render passes
    - render provider + useMutation
    - for each useMutation render (see react-apollo for example),
      verify we get back the right state from the resolver that we
      executed

Mutation Test
  1. verify the Mutation jsx component works properly
  How?
    - Render the component
    - Have a child function that receives the exec func + state
    - execute & verify state comes back
*/
