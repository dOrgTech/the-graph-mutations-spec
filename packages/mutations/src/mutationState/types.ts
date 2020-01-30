import {
  CoreEvents,
  CoreState
} from './core'
import { OptionalAsync } from '../utils'

import { BehaviorSubject } from 'rxjs'

// An aggregate of all possible MutationState properties
export type MutationState<TState> = CoreState & TState

// A collection of mutation states
export type MutationStates<TState> = {
  [mutation: string]: MutationState<TState>
}

// Mutation State Subscriptions
export class MutationStatesSub<TState> extends BehaviorSubject<MutationStates<TState>> { }
export class MutationStateSub<TState> extends BehaviorSubject<MutationState<TState>> { }
export type MutationStateSubs<TState> = MutationStateSub<TState>[]

// An aggregate of all possible MutationEvents
export type MutationEvents<TEventMap> = CoreEvents & TEventMap

export interface StateBuilder<TState, TEventMap extends EventTypeMap> {
  getInitialState(uuid: string): TState,
  // Event Specific Reducers
  reducers?: {
    [TEvent in keyof MutationEvents<TEventMap>]?: (
      state: MutationState<TState>,
      payload: InferEventPayload<TEvent, TEventMap>
    ) => OptionalAsync<Partial<MutationState<TState>>>
  },
  // Catch-All Reducer
  reducer?: (
    state: MutationState<TState>,
    event: Event
  ) => OptionalAsync<MutationState<TState>>
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
