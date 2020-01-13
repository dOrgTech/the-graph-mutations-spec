/// resolver.ts
import {
  EventPayload,
  StateBuilder,
  ManagedState
} from './'
import { TransactionSent } from './core'

interface MyEvent extends EventPayload {
  foo: string
}

type EventMap = {
  'MY_EVENT': MyEvent
}

interface State {
  myValue: string
  myFlag: boolean
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      myValue: "",
      myFlag: false
    }
  },
  reducers: {
    'MY_EVENT': (state: State, payload: MyEvent) => {

    },
    'TRANSACTION_SENT': (state: State, payload: TransactionSent) => {

    }
  }
}

const managedState = new ManagedState<State, EventMap>(stateBuilder)
const stateCopy = managedState.getState();
managedState.setState(stateCopy)

// managedState.sendEvent('TRANSACTION_SENT', { }) // error missing props
// managedState.sendEvent('something_not_present', { }) // error invalid event
managedState.sendEvent('MY_EVENT', { foo: "" })
