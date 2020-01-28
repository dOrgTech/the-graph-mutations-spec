import {
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

const stateBuilder: StateBuilder<{ }> = {
  getInitialState() {
    return { }
  }
}

export default {
  resolvers,
  config,
  stateBuilder
}
