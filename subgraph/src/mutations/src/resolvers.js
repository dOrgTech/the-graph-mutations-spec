import gql from "graphql-tag"
import * as protocol from "./protocol"

export const resolvers = {
  Mutation: {
    async createGravatar(_root, args, context) {
      const { web3, datasources } = context.thegraph
      await protocol.createGravatar(web3, datasources.Gravity, ...args);
      return await queryUserGravatar(context.client)
    },
    async updateGravatarName(_root, args, context) {
      const { web3, datasources } = context.thegraph
      await protocol.updateGravatarName(web3, datasources.Gravity, ...args)
      return await queryUserGravatar(context.client)
    },
    async updateGravatarImage(_root, args, context) {
      const { web3, datasources } = context.thegraph
      await protocol.updateGravatarImage(web3, datasources.Gravity, ...args)
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
