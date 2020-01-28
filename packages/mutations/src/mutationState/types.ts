import {
  CoreEvents,
  CoreState
} from './core'

export type MutationState<TState> = CoreState & TState

// A collection of mutation states
export type MutationStates<TState> = {
  [mutation: string]: TState
}

export type MutationEvents<TEventMap> = CoreEvents & TEventMap

export interface StateBuilder<TState, TEventMap extends EventTypeMap = { }> {
  getInitialState(uuid: string): TState,
  // Event Specific Reducers
  reducers?: {
    [TEvent in keyof MutationEvents<TEventMap>]?: (
      state: MutationState<TState>,
      payload: InferEventPayload<TEvent, TEventMap>
    ) => Promise<Partial<MutationState<TState>>>
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

export type ProgressValue = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|
41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|
88|89|90|91|92|93|94|95|96|97|98|99|100