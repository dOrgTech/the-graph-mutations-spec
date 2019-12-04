import gql from "graphql-tag"
import web3 from "./web3"
import * as protocol from "./protocol"
import Transaction from "../../class/Transaction.class";
import MutationState from "../../class/MutationState.class";

export const resolvers = {
  Mutations: {
    async createGravatar(_root, {options}, context) {
      const state = context.thegraph.mutationState as MutationState
      await protocol.createGravatar(options);

      // TODO: make this an open subscription, don't require
      // .publish(), have listener callback be called every
      // time something is edited
      // state.addTransaction(new Transaction('0x00000'));
      // state.publish();

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
