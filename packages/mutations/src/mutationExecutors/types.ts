import {
  MutationQuery,
  MutationResolvers,
  MutationResult
} from '../types'

export type MutationExecutor = (
  query: MutationQuery,
  resolvers: MutationResolvers
) => Promise<MutationResult>

export type MutationExecutors = {
  [prop: string]: MutationExecutor
}
