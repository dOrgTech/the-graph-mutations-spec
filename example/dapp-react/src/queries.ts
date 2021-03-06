import { gql } from 'apollo-boost';

export const GRAVATARS_QUERY = gql`
  query gravatars($where: Gravatar_filter!, $orderBy: Gravatar_orderBy!) {
    gravatars(first: 100, where: $where, orderBy: $orderBy, orderDirection: asc) {
      id
      owner
      displayName
      imageUrl
    }
  }
`

export const CREATE_GRAVATAR = gql`
  mutation createGravatar($options: GravatarOptions) {
    createGravatar(options: $options) @client{
      id
      owner
      displayName
      imageUrl
    }
  }
`

export const UPDATE_GRAVATAR_NAME = gql`
  mutation updateGravatarName($displayName: String!) {
    updateGravatarName(displayName: $displayName) @client{
      id
      owner
      displayName
      imageUrl
    }
  }
`

export const UPDATE_GRAVATAR_IMAGE = gql`
  mutation updateGravatarImage($imageUrl: String!) {
    updateGravatarImage(imageUrl: $imageUrl) {
      id
      owner
      displayName
      imageUrl
    }
  }
`

export const DELETE_GRAVATAR = gql`
  mutation deleteGravatar {
    deleteGravatar @client
  }
`

export const TEST_TRIPLE_UPDATE = gql`
  mutation updateGravatarName {
    updateGravatarName(displayName: "First") @client{
      id
      owner
      displayName
      imageUrl
    }

    updateGravatarName(displayName: "Second") @client{
        id
        owner
        displayName
        imageUrl
    }

    updateGravatarName(displayName: "Third") @client{
        id
        owner
        displayName
        imageUrl
    }
  }
`