/*
1. static state
  - mutation defined properties
2. event stream
  - mutation defined event types & data
3. reducers
  - mutation defined reducers
  - app defined reducers (append)
*/

// resolvers
import { MutationState } from "@graphprotocol/mutations-ts"

class State extends MutationState {
  // TODO: add new static fields
  // TODO: add new event types
  // TODO: add new reducers
}

const resolvers = {
  foo: (_, args, context) => {
    // do things
  }
}

export {
  resolvers,
  State
}

// in the app
import Mutations from "mutations-package";
import { createMutations } from "..";

type MutationState = Mutations.State;

createMutations({
  mutations: Mutations, // knows `new Mutations.State()` is required for every mutation execution
})

const [exec, mutationState] = useMutationAndSubscribe<MutationState>(MUTATION_QUERY)

/*
<button onChange={exec} />
<Progress value={mutationState.progress} />
mutationState.someValue
*/
