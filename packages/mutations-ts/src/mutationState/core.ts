import {
  EventPayload,
  EventLog,
  StateBuilder
} from './types'

export interface CoreState {
  progress: Number
  events: EventLog
}

export type FullState<TState> = CoreState & TState

export type CoreEvents = {
  'TRANSACTION_SENT': TransactionSent,
  'TRANSACTION_ERROR': TransactionError
}

export interface TransactionSent extends EventPayload {
  hash: string
  to: string
  value: string
}

export interface TransactionError extends EventPayload {
  hash: string
  error: Error
}

export const coreStateBuilder: StateBuilder<CoreState, CoreEvents> = {
  getInitialState(): CoreState {
    return {
      progress: 0,
      events: []
    }
  },
  reducers: {
    'TRANSACTION_SENT': (state: CoreState, payload: TransactionSent) => {
      
    },
    'TRANSACTION_ERROR': (state: CoreState, payload: TransactionError) => {
      
    }
  }
}
