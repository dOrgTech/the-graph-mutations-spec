import {
  MutationComponentOptionsWithState,
  MutationTupleWithState
} from './types'
import { MutationStatesSub } from '@graphprotocol/mutations/dist/mutationState'
import {
  CoreState,
  MutationStates
} from '@graphprotocol/mutations/dist/mutationState'

import {
  useEffect,
  useState
} from 'react'
import {
  useMutation as apolloUseMutation,
  MutationHookOptions
} from '@apollo/react-hooks'
import { OperationVariables } from '@apollo/react-common'
import { DocumentNode } from 'graphql'

export const useMutation = <
  TState = CoreState,
  TData = any,
  TVariables = OperationVariables
>(
  mutation: DocumentNode,
  mutationOptions: MutationHookOptions<TData, TVariables>
): MutationTupleWithState<TState, TData, TVariables> => {

  const [state, setState] = useState({} as MutationStates<TState>)
  const [observable] = useState(new MutationStatesSub<TState>({ }))

  mutationOptions.context = {
    ...mutationOptions.context,
    client: mutationOptions.client,
    graph: {
      __stateObserver: observable
    }
  }

  const [execute, result] = apolloUseMutation(
    mutation, mutationOptions
  )

  useEffect(() => {
    let subscription = observable.subscribe(result => {
      if (result) {
        setState(result)
      }
    })
    return () => subscription.unsubscribe()
  }, [observable, setState])

  return [
    execute,
    {
      ...result,
      state
    }
  ]
}

export const Mutation = <
  TState = CoreState,
  TData = any,
  TVariables = OperationVariables
>(
  props: MutationComponentOptionsWithState<TState, TData, TVariables>
) => {
  const [runMutation, result] = useMutation<TState>(props.mutation, props)
  return props.children ? props.children(runMutation, result) : null
}
