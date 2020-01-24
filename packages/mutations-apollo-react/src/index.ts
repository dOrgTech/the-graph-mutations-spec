import { MutationTupleWithState } from './types'
import { useObservable } from './utils'
import {
  CoreState,
  MutationStates
} from '@graphprotocol/mutations'

import {
  useState
} from 'react'
import {
  useMutation as apolloUseMutation,
  MutationHookOptions,
} from '@apollo/react-hooks'
import { OperationVariables } from '@apollo/react-common'
import { DocumentNode } from 'graphql'
import { BehaviorSubject } from 'rxjs'

export const useMutation = <
  TState = CoreState,
  TData = any,
  TVariables = OperationVariables
>(
  mutation: DocumentNode,
  mutationOptions: MutationHookOptions<TData, TVariables>
): MutationTupleWithState<TState, TData, TVariables> => {

  const [state, setState] = useState({} as MutationStates<TState>)
  const [observable] = useState(new BehaviorSubject({} as MutationStates<TState>))

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

  useObservable(observable, setState)

  return [
    execute,
    {
      ...result,
      state
    }
  ]
}
