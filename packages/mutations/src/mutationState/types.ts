import {
  CoreEvents,
  CoreState
} from './core'

export type MutationState<TState> = CoreState & TState

// A collection of mutation states
export type MutationStates<TState> = {
  [mutation: string]: MutationState<TState>
}

export type MutationEvents<TEventMap> = CoreEvents & TEventMap

export interface StateBuilder<TState, TEventMap extends EventTypeMap> {
  getInitialState(uuid: string): TState,
  // Event Specific Reducers
  reducers?: {
    [TEvent in keyof MutationEvents<TEventMap>]?: (
      state: MutationState<TState>,
      payload: InferEventPayload<TEvent, TEventMap>
    ) => Promise<MutationState<TState>>
  },
  // Catch-All Reducer
  reducer?: (
    state: MutationState<TState>,
    event: Event
  ) => Promise<MutationState<TState>>,
}

export interface EventPayload { }

export interface Event {
  name: string
  payload: EventPayload
}

export interface EventTypeMap {
  [eventName: string]: EventPayload
}

export type InferEventPayload<TEvent extends keyof TEvents, TEvents extends EventTypeMap> =
  TEvent extends keyof TEvents ? TEvents[TEvent] :
  any
