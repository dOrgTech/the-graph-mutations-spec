import { v4 } from 'uuid'
import { CoreState } from '../core'
import { StateBuilder, MutationState, EventTypeMap, EventPayload } from '../types'
import { StateUpdater } from '../index'
import { BehaviorSubject } from 'rxjs'

describe("Core Mutation State", () => {

  let uuid: string
  let latestState: CoreState;
  let observer: BehaviorSubject<CoreState>
  let state: StateUpdater<CoreState, EventTypeMap>

  beforeEach(() => {

    uuid = v4()

    observer = new BehaviorSubject<CoreState>({} as CoreState)

    state = new StateUpdater<CoreState, EventTypeMap>(
      uuid, undefined, observer
    )

    observer.subscribe((value) => {
      latestState = value
    })
  })

  it("Correctly dispatches state update", async () => {
    await state.dispatch("PROGRESS_UPDATE", { value: 5 })

    expect(latestState.uuid).toEqual(uuid)
    expect(latestState.progress).toEqual(5)
    expect(latestState.events).toHaveLength(1)
    expect(latestState.events[0].name).toEqual("PROGRESS_UPDATE")
    expect(latestState.events[0].payload).toEqual({ value: 5 })

  })

  it("State dispatched is immutable", async () => {
    await state.dispatch("PROGRESS_UPDATE", { value: 5 })

    latestState.progress = 100;

    await state.dispatch("TRANSACTION_CREATED", {
      id: "Test Id",
      description: "Test Description"
    })

    expect(latestState.progress).toEqual(5)

  })

  it("Fails if PROGRESS_UPDATE event receives number lower than 0 or higher than 100 or non integer", async () => {
    expect(state.dispatch("PROGRESS_UPDATE", { value: 105 } as any)).rejects.toThrow()
    expect(state.dispatch("PROGRESS_UPDATE", { value: -5 } as any)).rejects.toThrow()
    expect(state.dispatch("PROGRESS_UPDATE", { value: 10.5 } as any)).rejects.toThrow()
  })

})

describe("Extended Mutation State", () => {

  interface CustomEvent extends EventPayload {
    myValue: string
  }
  
  interface EventMap extends EventTypeMap {
    'CUSTOM_EVENT': CustomEvent
  }
  
  interface State {
    myValue: string
    myFlag: boolean
  }

  let uuid: string
  let latestState: State;
  let observer: BehaviorSubject<State>
  let state: StateUpdater<State, EventTypeMap>
  
  const stateBuilder: StateBuilder<State, EventMap> = {
    getInitialState(): State {
      return {
        myValue: '',
        myFlag: false
      }
    },
    reducers: {
      'CUSTOM_EVENT': async (state: MutationState<State>, payload: CustomEvent) => {
        return {
          myValue: 'true'
        }
      }
    }
  }

  beforeEach(() => {

    uuid = v4()

    observer = new BehaviorSubject<State>({} as State)

    state = new StateUpdater<State, EventMap>(
      uuid, stateBuilder, observer
    )

    observer.subscribe((value) => {
      latestState = value
    })
  })

  it("Works", () => {
    
  })

})