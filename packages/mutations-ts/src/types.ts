import { ExecutionResult } from 'graphql/execution'
import { DocumentNode } from 'graphql/language'
import { GraphQLFieldResolver } from 'graphql'

export interface Resolvers {
  [key: string]: {
      [field: string]: GraphQLFieldResolver<any, any>;
  };
}
export interface MutationQuery {
  query: DocumentNode
  variables: Record<string, any>
  operationName: string
  extensions?: Record<string, any>
  setContext: (context: Record<string, any>) => Record<string, any>
  getContext: () => Record<string, any>
  uuid: string
}

export interface MutationResult {
  result: ExecutionResult
}

export type MutationExecutor = (query: MutationQuery, resolvers: Resolvers) => Promise<MutationResult>

export interface Mutations<TConfig extends ConfigSetters> {
  execute: (query: MutationQuery) => Promise<MutationResult>
  configure: (config: ConfigGetters<TConfig>) => void
}

export type ConfigSetters = {
  [key: string]: ((value: any) => any) | ConfigSetters
}

// Validate that all leaf property values of the ConfigGetters
// instance match the type of the ConfigSetters function arguments
type SetterValue<T> =
  T extends ((value: infer U) => any) ? U : ConfigGetters<T>

type GetterFunc<T> =
  (() => SetterValue<T>) | (() => Promise<SetterValue<T>>)

type ConfigGetterProp<T> = SetterValue<T> | GetterFunc<T>

export type ConfigGetters<T> = {
  [Prop in keyof T]: ConfigGetterProp<T[Prop]>
}

export type ConfigValues<T> = {
  [Prop in keyof T]: SetterValue<T[Prop]>
}
