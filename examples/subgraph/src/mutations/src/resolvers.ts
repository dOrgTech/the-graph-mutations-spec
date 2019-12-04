import gql from "graphql-tag"
import web3 from "./web3"
import * as protocol from "./protocol"
import {MutationState} from "@graphmutations/mutations-ts";

export const resolvers = {
  Mutations: {
    async createGravatar(_root, {options}, context) {
      const state = context.thegraph.mutationState as MutationState
      await protocol.createGravatar(options);

      // state.addTransaction('0x00000');
      // state.updateTxProgress('0x00000', 35)

      // TODO: what does this really look like in the application
      // to the user

      return await queryUserGravatar(context.client)
    },
    async updateGravatarName(_root, {displayName}, context) {
      await protocol.updateGravatarName(displayName)
      return await queryUserGravatar(context.client)
    },
    async updateGravatarImage(_root, {imageUrl}, context) {
      await protocol.updateGravatarImage(imageUrl)
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
