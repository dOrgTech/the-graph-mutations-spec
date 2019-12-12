import { ExecutionResult } from 'graphql/execution'
import { DocumentNode } from 'graphql/language'

export interface Query {
  document: DocumentNode
  variables?: Record<string, any>
  operationName?: string
}

export interface QueryResult {
  result: ExecutionResult
}

export type Mutations = (query: Query) => Promise<QueryResult>

export type ConfigSetters = {
  [key: string]: ((value: any) => any) | ConfigSetters
}

type ConfigGetterValue<T> = T extends ((value: infer U) => any) ? U : ConfigGetters<T>

export type ConfigGetters<T> = {
  [Prop in keyof T]: ConfigGetterValue<T[Prop]>
}
