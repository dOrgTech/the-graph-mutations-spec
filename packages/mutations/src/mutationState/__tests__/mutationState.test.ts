import { v4 } from 'uuid'
import { CoreState } from '../core'
import {
  Event,
  EventTypeMap,
  EventPayload,
  MutationState,
  MutationStateSub,
  StateBuilder
} from '../types'
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

  it("Dispatches state updates in correct order", async () => {
    await state.dispatch("PROGRESS_UPDATE", { value: 5 })
    await state.dispatch("TRANSACTION_CREATED", {
      id: "Test Id",
      description: "Test Description"
    })

    const currentState = state.current

    expect(currentState.events[0].name).toEqual("PROGRESS_UPDATE")
    expect(currentState.events[0].payload).toEqual( { value: 5 })

    expect(currentState.events[1].name).toEqual("TRANSACTION_CREATED")
    expect(currentState.events[1].payload).toEqual( {
      id: "Test Id",
      description: "Test Description"
    })

  })

  it("Fails if PROGRESS_UPDATE event receives number lower than 0 or higher than 100 or non integer", async () => {
    expect(state.dispatch("PROGRESS_UPDATE", { value: 105 } as any)).rejects.toThrow()
    expect(state.dispatch("PROGRESS_UPDATE", { value: -5 } as any)).rejects.toThrow()
    expect(state.dispatch("PROGRESS_UPDATE", { value: 10.5 } as any)).rejects.toThrow()
  })

})

describe("Extended Mutation State", () => {

  interface CustomEvent extends EventPayload {
    myValue: string,
    myFlag: boolean
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
  let observer: MutationStateSub<State>
  let state: StateUpdater<State, EventTypeMap>
  
  const stateBuilder: StateBuilder<State, EventMap> = {
    getInitialState(): State {
      return {
        myValue: 'initial',
        myFlag: true
      }
    },
    reducers: {
      'CUSTOM_EVENT': async (state: MutationState<State>, payload: CustomEvent) => {
        return {
          myValue: 'true'
        }
      }
    },
    reducer: async (state: MutationState<State>, event: Event) => {
      return { }
    }
  }

  beforeEach(() => {

    uuid = v4()

    observer = new MutationStateSub<State>({} as MutationState<State>)

    state = new StateUpdater<State, EventMap>(
      uuid, stateBuilder, observer
    )

    observer.subscribe((value) => {
      latestState = value
    })
  })

  it("Includes extended state with correct initial values", () => {
    const currentState = state.current;
    
    expect(currentState.myFlag).toEqual(true)
    expect(currentState.myValue).toEqual('initial')
  })

  it("Correctly executes CUSTOM_EVENT defined reducer", async () => {
    await state.dispatch("CUSTOM_EVENT", { myFlag: false, myValue: 'false'})

    const currentState = state.current;
    
    expect(currentState.myFlag).toEqual(true)
    expect(currentState.myValue).toEqual('true')
  })

  it("Includes custom events alongside core events in the events history", async () => {
    await state.dispatch("PROGRESS_UPDATE", { value: 5 })
    await state.dispatch("CUSTOM_EVENT", { myFlag: false, myValue: 'false'})

    const currentState = state.current;
    
    expect(currentState.events[1].name).toEqual("CUSTOM_EVENT")
    expect(currentState.events[1].payload).toEqual({ myFlag: false, myValue: 'false'})
  })

  // it("Executes catch-all reducer", async () => {
  //   await state.dispatch("RANDOM_EVENT", { myFlag: false, myValue: 'false'})

  //   const currentState = state.current;

  //   console.log(currentState)
  // })

})