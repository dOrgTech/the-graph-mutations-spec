import {
  EventPayload,
  MutationState,
  StateBuilder
} from '../src'

const resolvers = {
  Mutation: {
    execFoo: () => {},
    execBar: () => {}
  }
}

const config = {
  a: (name: string): string => {
    return `Hi my name is ${name}!`
  },
  b: (value: number): number => {
    return 1 + value
  },
  c: {
    d: {
      e: (value: boolean): string => {
        return 'hey'
      }
    }
  }
}

interface State {
  myValue: boolean
}

interface MyEvent extends EventPayload {
  myValue: boolean
}

type Events = {
  'MY_EVENT': MyEvent
}

const stateBuilder: StateBuilder<State, Events> = {
  getInitialState() {
    return {
      myValue: false
    }
  },
  reducers: {
    'MY_EVENT': (state: MutationState<State>, payload: MyEvent) => {
      return {
        myValue: payload.myValue
      }
    }
  }
}

export default {
  resolvers,
  config,
  stateBuilder
}
