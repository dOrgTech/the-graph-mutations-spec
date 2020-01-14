import {
  EventPayload,
  EventLog,
  StateBuilder
} from './types'

export interface CoreState {
  events: EventLog
}

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
      events: []
    }
  },
  reducers: {
    'TRANSACTION_SENT': async (state: CoreState, payload: TransactionSent) => {
      
    },
    'TRANSACTION_ERROR': async (state: CoreState, payload: TransactionError) => {
      
    }
  }
}
