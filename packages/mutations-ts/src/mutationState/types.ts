import {
  CoreEvents,
  CoreState
} from './core'

export type FullState<TState> = CoreState & TState

export interface StateBuilder<TState, TEventMap extends EventMap = { }> {
  getInitialState(uuid: string): TState
  reducers?: {
    [TEvent in keyof (TEventMap & CoreEvents)]?: (
      state: FullState<TState>,
      payload: InferEventPayload<TEvent, TEventMap>
    ) => Promise<FullState<TState>>
  }
  reducer?: (state: FullState<TState>, event: string, payload: any) => Promise<FullState<TState>>
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
