import {
  CoreEvents,
  CoreState
} from './core'

export type FullState<TState> = CoreState & TState

export interface StateBuilder<TState, TEventMap extends EventMap = { }> {
  getInitialState(): TState
  reducers?: {
    [TEvent in keyof (TEventMap & CoreEvents)]?: (
      state: FullState<TState>,
      payload: InferEventPayload<TEvent, TEventMap>
    ) => void
  }
  reducer?: (state: FullState<TState>, event: string, payload: any) => void
}

export interface EventPayload { }

export interface Event {
  event: string
  payload: EventPayload
}

export type EventLog = Event[]

export type EventMap = {
  [event: string]: EventPayload
}

export type InferEventPayload<TEvent extends keyof TEvents, TEvents extends EventMap> =
  TEvent extends keyof TEvents ? TEvents[TEvent] :
  any
