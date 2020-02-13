import {
  Event,
  EventTypeMap,
  MutationEvents,
  MutationState,
  InferEventPayload,
  StateBuilder,
  MutationStateSubject
} from './types'
import { coreStateBuilder as core } from './core'
import { executeMaybeAsyncFunction } from '../utils'

import { cloneDeep, merge } from 'lodash'

export * from './core'
export * from './types'

class StateUpdater<
  TState,
  TEventMap extends EventTypeMap
> {

  private _state: MutationState<TState, TEventMap>
  private _subject?: MutationStateSubject<TState, TEventMap>
  private _ext?: StateBuilder<TState, TEventMap>

  constructor(
    uuid: string,
    ext?: StateBuilder<TState, TEventMap>,
    subscriber?: MutationStateSubject<TState, TEventMap>
  ) {
    this._ext = ext
    this._subject = subscriber

    this._state = {
      events: [],
      ...core.getInitialState(uuid),
      ...(this._ext ? this._ext.getInitialState(uuid) : { } as TState),
    }

    // Publish the initial state
    this.publish()
  }

  public get current() {
    return cloneDeep(this._state)
  }

  public async dispatch<TEvent extends keyof MutationEvents<TEventMap>>(
    eventName: TEvent,
    payload: InferEventPayload<TEvent, MutationEvents<TEventMap>>
  ) {

    const event: Event<TEventMap> = {
      name: eventName,
      payload
    }

    // Append the event
    this._state.events.push(event)

    // Call all relevant reducers
    const coreReducers = core.reducers as any
    const coreReducer = core.reducer
    const extReducers = this._ext?.reducers as any
    const extReducer = this._ext?.reducer

    if (coreReducers && coreReducers[event.name] !== undefined) {
      const coreStatePartial = await executeMaybeAsyncFunction(coreReducers[event.name], cloneDeep(this._state), payload)
      this._state = merge(this._state, coreStatePartial)
    } else if (coreReducer) {
      const coreStatePartial = await executeMaybeAsyncFunction(coreReducer, cloneDeep(this._state), event)
      this._state = merge(this._state, coreStatePartial)
    }

    if (extReducers && extReducers[event.name] !== undefined) {
      const extStatePartial = await executeMaybeAsyncFunction(extReducers[event.name], cloneDeep(this._state), payload)
      this._state = merge(this._state, extStatePartial)
    } else if (extReducer) {
      const extStatePartial = await executeMaybeAsyncFunction(extReducer, cloneDeep(this._state), event)
      this._state = merge(this._state, extStatePartial)
    }

    // Publish the latest state
    this.publish()
  }

  private publish() {
    if (this._subject) {
      this._subject.next(cloneDeep(this._state))
    }
  }
}

export { StateUpdater }

