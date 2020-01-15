import {
  execute,
  makePromise
} from 'apollo-link'
import { withClientState } from 'apollo-link-state'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {
  MutationQuery,
  MutationResult,
  Resolvers
} from '../types'
import {
  hasDirectives
} from '../utils'

export default async (mutationQuery: MutationQuery, resolvers: Resolvers): Promise<MutationResult> => {
  // @client directive must be used
  if (!hasDirectives(['client'], mutationQuery.query)) {
    throw new Error(`Mutation '${mutationQuery.operationName}' is missing client directive`)
  }

  // TODO: note that this is being thrown away each time... desired?
  const cache = new InMemoryCache()
  const link = withClientState({
    cache,
    resolvers
  })

  let result = await makePromise(
    execute(link, {
      query: mutationQuery.query,
      variables: mutationQuery.variables,
      operationName: mutationQuery.operationName,
      context: mutationQuery.getContext()
    })
  )
  return { result }
}
