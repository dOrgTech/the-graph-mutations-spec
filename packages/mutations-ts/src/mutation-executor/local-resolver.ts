import { execute, makePromise } from 'apollo-link'
import { withClientState } from 'apollo-link-state'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { MutationQuery, MutationResult, Resolvers } from '../types'
import { OperationDefinitionNode } from 'graphql'

export default async (mutationQuery: MutationQuery, resolvers: Resolvers): Promise<MutationResult> => {
  // TODO: note that this is being thrown away each time... desired?
  const cache = new InMemoryCache()
  const link = withClientState({
    cache,
    resolvers
  })

  if(mutationQuery.query.definitions[0].kind === "OperationDefinition"){
    const directives = mutationQuery.query.definitions[0].selectionSet.selections[0].directives;
    if(!directives || !directives.find(directive => directive.name.value === "client")){
      throw new Error(`Mutation '${mutationQuery.operationName}' is missing client directive`)
    }
  }
  
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
