import { MutationStates } from '@graphprotocol/mutations-ts'

import {
  MutationFunctionOptions,
  ExecutionResult,
  MutationResult
} from '@apollo/react-common'

interface MutationResultWithState<TState, TData = any> extends MutationResult<TData> {
  state: MutationStates<TState>
}

export type MutationTupleWithState<TState, TData, TVariables> = [
  (
    options?: MutationFunctionOptions<TData, TVariables>
  ) => Promise<ExecutionResult<TData>>,
  MutationResultWithState<TState, TData>
];
