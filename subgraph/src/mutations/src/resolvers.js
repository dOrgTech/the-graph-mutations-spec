import gql from "graphql-tag"
import web3 from "./web3"
import * as protocol from "./protocol"

// TODO: local store + optimistic updates

export const resolvers = {
  Mutations: {
    async createGravatar(_root, args, context) {
      await protocol.createGravatar(...args);
      return await queryUserGravatar(context.client)
    },
    async updateGravatarName(_root, args, context) {
      await protocol.updateGravatarName(...args)
      return await queryUserGravatar(context.client)
    },
    async updateGravatarImage(_root, args, context) {
      await protocol.updateGravatarImage(...args)
      return await queryUserGravatar(context.client)
    }
  }
}

async function queryUserGravatar(client) {
  return await client.query(gql`
  {
    gravatar(owner: ${web3.eth.defaultAccount}) {
      id
      owner
      displayName
      imageUrl
    }
  }`)
}
