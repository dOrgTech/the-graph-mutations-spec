import {
  EventPayload,
  EventMap,
  FullState,
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

class ManagedState<
  TState = { },
  TEventMap extends EventMap = { }
> {

  private _state: FullState<TState>
  private _observer?: BehaviorSubject<TState>
  private _ext: StateBuilder<TState, TEventMap>
  private _core: StateBuilder<CoreState, CoreEvents>

  constructor(
    ext: StateBuilder<TState, TEventMap>,
    observer?: BehaviorSubject<TState>
  ) {
    this._observer = observer
    this._ext = ext
    this._core = coreStateBuilder

    this._state = {
      ...this._core.getInitialState(),
      ...this._ext.getInitialState()
    }
  }

  public async sendEvent<TEvent extends keyof (CoreEvents & TEventMap)>(
    event: TEvent,
    payload: InferEventPayload<TEvent, CoreEvents & TEventMap>
  ) {

    // Append the event
    this._state.events.push({
      event: event as string,
      payload
    })

    // Call all relevant reducers
    const coreReducers = this._core.reducers as any
    const coreReducer = this._core.reducer
    const extReducers = this._ext.reducers as any
    const extReducer = this._core.reducer

    if (coreReducers && coreReducers[event] !== undefined) {
      await coreReducers[event](this._state, payload)
    } else if (coreReducer) {
      await coreReducer(this._state, event as string, payload)
    }

    if (extReducers && extReducers[event] !== undefined) {
      await extReducers[event](this._state, payload)
    } else if (extReducer) {
      await extReducer(this._state, event as string, payload)
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

export {
  EventPayload,
  EventMap,
  StateBuilder,
  FullState,
  ManagedState,
  CoreState
}
