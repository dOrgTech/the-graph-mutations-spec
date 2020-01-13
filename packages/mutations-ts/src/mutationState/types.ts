import { CoreEvents } from './core'

export interface StateBuilder<TState, TEventMap extends EventMap = { }> {
  getInitialState(): TState
  reducers?: {
    [TEvent in keyof (TEventMap & CoreEvents)]?: (
      state: TState,
      payload: InferEventPayload<TEvent, TEventMap>
    ) => void
  }
  reducer?: (state: TState, event: string, payload: any) => void
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

export type InferEventPayload<TEvent extends keyof (CoreEvents & TEvents), TEvents extends EventMap> =
  TEvent extends keyof CoreEvents ? CoreEvents[TEvent] :
  TEvent extends keyof TEvents ? TEvents[TEvent] :
  any
