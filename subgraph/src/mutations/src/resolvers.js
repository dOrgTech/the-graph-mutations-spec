import gql from "graphql-tag"
import * as protocol from "./protocol"

export const resolvers = {
  Mutation: {
    async createGravatar(_root, args, context) {
      await protocol.createGravatar(context.thegraph.web3, ...args);
      return await queryUserGravatar(context.client)
    },
    async updateGravatarName(_root, args, context) {
      await protocol.updateGravatarName(context.thegraph.web3, ...args)
      return await queryUserGravatar(context.client)
    },
    async updateGravatarImage(_root, args, context) {
      await protocol.updateGravatarImage(context.thegraph.web3, ...args)
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
