import {
  EventPayload,
  StateBuilder,
  Event,
  ProgressValue
} from './types'

export type EventLog = Event[]

export interface CoreState {
  events: EventLog
  uuid: string
  progress: ProgressValue
}

export type CoreEvents = {
  'TRANSACTION_CREATED': TransactionCreatedEvent
  'TRANSACTION_COMPLETED': TransactionCompletedEvent
  'TRANSACTION_ERROR': TransactionErrorEvent
  'PROGRESS_UPDATE': ProgressUpdateEvent
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

export interface ProgressUpdateEvent extends EventPayload {
  value: ProgressValue
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
    },
    'PROGRESS_UPDATE': async (state: CoreState, payload: ProgressUpdateEvent) => {
      if (payload.value < 0 || payload.value > 100) {
        throw new Error('Progress value must be an integer between 0 and 100')
      }

      return {
        progress: payload.value
      }
    }
  }
}
