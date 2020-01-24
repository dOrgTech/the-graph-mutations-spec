import { MutationStates } from '@graphprotocol/mutations'

import {
  BaseMutationOptions,
  ExecutionResult,
  MutationResult,
  MutationFunction,
  MutationFunctionOptions
} from '@apollo/react-common'
import { DocumentNode } from 'graphql'

interface MutationResultWithState<TState, TData = any> extends MutationResult<TData> {
  state: MutationStates<TState>
}

export type MutationTupleWithState<TState, TData, TVariables> = [
  (
    options?: MutationFunctionOptions<TData, TVariables>
  ) => Promise<ExecutionResult<TData>>,
  MutationResultWithState<TState, TData>
];

export interface MutationComponentOptionsWithState<
  TState,
  TData,
  TVariables
> extends BaseMutationOptions<TData, TVariables> {
  mutation: DocumentNode;
  children: (
    mutateFunction: MutationFunction<TData, TVariables>,
    result: MutationResultWithState<TState, TData>
  ) => JSX.Element | null;
}
