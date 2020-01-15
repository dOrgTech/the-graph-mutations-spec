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
  id: string,
  description: string
}

export interface TransactionError extends EventPayload {
  id: string
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
      return state;      
    },
    'TRANSACTION_ERROR': async (state: CoreState, payload: TransactionError) => {
      return state;
    }
  }
}
