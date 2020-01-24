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
  'TRANSACTION_CREATED': TransactionCreatedEvent
  'TRANSACTION_COMPLETED': TransactionCompletedEvent
  'TRANSACTION_ERROR': TransactionErrorEvent
}

export interface TransactionCreatedEvent extends EventPayload {
  id: string,
  description: string
}

export interface TransactionCompletedEvent extends EventPayload {
  id: string,
  description: string
}

export interface TransactionErrorEvent extends EventPayload {
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
    'TRANSACTION_CREATED': async (state: CoreState, payload: TransactionCreatedEvent) => {
      return state;
    },
    'TRANSACTION_COMPLETED': async (state: CoreState, payload: TransactionCreatedEvent) => {
      return state;
    },
    'TRANSACTION_ERROR': async (state: CoreState, payload: TransactionErrorEvent) => {
      return state;
    }
  }
}
