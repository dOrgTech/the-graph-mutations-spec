import {
  EventPayload,
  StateBuilder,
  Event
} from './types'

export type EventLog = Event[]

export interface CoreState {
  events: EventLog
  uuid: string
  progress: number
}

export type CoreEvents = {
  'TRANSACTION_CREATED': TransactionCreated,
  'TRANSACTION_COMPLETED': TransactionCompleted
  'TRANSACTION_ERROR': TransactionError
}

export interface TransactionCreated extends EventPayload {
  id: string,
  description: string
}

export interface TransactionCompleted extends EventPayload {
  id: string,
  description: string
}

export interface TransactionError extends EventPayload {
  id: string
  error: Error
}

export const coreStateBuilder: StateBuilder<CoreState, CoreEvents> = {
  getInitialState(uuid: string): CoreState {
    return {
      events: [],
      progress: 0,
      uuid
    }
  },
  reducers: {
    'TRANSACTION_CREATED': async (state: CoreState, payload: TransactionCreated) => {
      return state;      
    },
    'TRANSACTION_COMPLETED': async (state: CoreState, payload: TransactionCreated) => {
      return state;      
    },
    'TRANSACTION_ERROR': async (state: CoreState, payload: TransactionError) => {
      return state;
    }
  }
}
