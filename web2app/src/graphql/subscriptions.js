import gql from 'graphql-tag';

export const NEW_TODO_SUBSCRIPTION = gql`
  subscription onProgress($requestId: ID!) {
      progress(requestId: $requestId)
    }
`