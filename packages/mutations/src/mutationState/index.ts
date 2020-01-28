import {
  Event,
  EventTypeMap,
  MutationEvents,
  MutationState,
  InferEventPayload,
  StateBuilder
} from './types'
import {
  CoreEvents,
  CoreState,
  coreStateBuilder
} from './core'

import { BehaviorSubject } from 'rxjs'
import cloneDeep from 'lodash/cloneDeep'

class StateUpdater<
  TState,
  TEventMap extends EventTypeMap
> {

  private _state: MutationState<TState>
  private _observer?: BehaviorSubject<TState>
  private _ext?: StateBuilder<TState, TEventMap>
  private _core: StateBuilder<CoreState, CoreEvents>

  constructor(
    uuid: string,
    ext?: StateBuilder<TState, TEventMap>,
    observer?: BehaviorSubject<TState>
  ) {
    this._observer = observer
    this._ext = ext
    this._core = coreStateBuilder

    this._state = {
      ...this._core.getInitialState(uuid),
      ...(this._ext ? this._ext.getInitialState(uuid) : { } as TState),
    }
  }

  public get current() {
    return cloneDeep(this._state)
  }

  public async dispatch<TEvent extends keyof MutationEvents<TEventMap>>(
    eventName: TEvent,
    payload: InferEventPayload<TEvent, MutationEvents<TEventMap>>
  ) {

    const event: Event = {
      name: eventName as string,
      payload
    }

    // Append the event
    this._state.events.push(event)

    // Call all relevant reducers
    const coreReducers = this._core.reducers as any
    const coreReducer = this._core.reducer
    const extReducers = this._ext?.reducers as any
    const extReducer = this._ext?.reducer

    if (coreReducers && coreReducers[event.name] !== undefined) {
      const coreState = await coreReducers[event.name](cloneDeep(this._state), payload)
      this._state = cloneDeep({...this._state, ...coreState})
    } else if (coreReducer) {
      const coreState = await coreReducer(cloneDeep(this._state), event)
      this._state = cloneDeep({...this._state, ...coreState})
    }

    if (extReducers && extReducers[event.name] !== undefined) {
      this._state = await extReducers[event.name](cloneDeep(this._state), payload)
    } else if (extReducer) {
      this._state = await extReducer(cloneDeep(this._state), event)
    }

    // Publish the latest state
    this.publish()
  }

  private publish() {
    if (this._observer) {
      this._observer.next(cloneDeep(this._state))
    }
  }
}

export { StateUpdater }
export * from './core'
export * from './types'
