import gql from "graphql-tag"
import { ethers } from "ethers"
import IPFSClient from "ipfs-http-client"
import { MutationState } from "@graphprotocol/mutations-ts"

export class State extends MutationState{
  public staticProperty = {};
}

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.thegraph.config

  return await client.query({
    query: gql`
      query GetGravatars {
        gravatar (id: '${ethereum.provider.selectedAddress}') {
          id
          owner
          displayName
          imageUrl
        }
      }`
    }
  )
}

async function sendTx(tx: any, id: string, msg: string, progress: number, context: any) {
  const state: MutationState = context.state;
  try {
    state.startTransaction({id, title: msg, payload: {}})
    tx = await tx
    state.confirmTransaction(id, progress, tx)
    await tx.wait()
  } catch (error) {
    state.addError(id, error)
    throw new Error(`Failed while sending "${msg}"`)
  }
}

async function getGravityContract(context: any) {
  const { ethereum } = context.thegraph.config
  const abi = await context.thegraph.dataSources.Gravity.abi
  const address = await context.thegraph.dataSources.Gravity.address

  const contract = new ethers.Contract(
    address, abi, ethereum.getSigner()
  )
  contract.connect(ethereum)
  return contract
}

async function createGravatar(_root: any, {options}: any, context: any) {
  const { displayName, imageUrl } = options
  const gravity = await getGravityContract(context)
  const tx = await gravity.createGravatar(displayName, imageUrl)
  //await sendTx(tx, "Creating Gravatar", context)
  return await queryUserGravatar(context)
}

async function updateGravatarName(_root: any, {displayName}: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.updateGravatarName(displayName)
  const randId = Math.floor(Math.random()*(10000000000+1)).toString();
  await sendTx(tx, randId ,"Updating Gravatar Name", 0.25, context)
  return await queryUserGravatar(context)
}

async function updateGravatarImage(_root: any, {imageUrl}: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.updateGravatarImage(imageUrl)

  // Example of custom data within the state
  context.thegraph.state.addData("imageUrl", imageUrl)

  //await sendTx(tx, "Updating Gravatar Image", context)
  return await queryUserGravatar(context)
}

const resolvers = {
  Mutation: {
    createGravatar,
    updateGravatarName,
    updateGravatarImage
  }
}

const config = {
  ethereum: (provider: any) => {
    return new ethers.providers.Web3Provider(provider)
  },
  ipfs: (provider: string) => {
    const url = new URL(provider)
    return IPFSClient({
      protocol: url.protocol.replace(/[:]+$/, ''),
      host: url.hostname,
      port: url.port,
      'api-path': url.pathname.replace(/\/$/, '') + '/api/v0/',
    })
  },
  // Example of a custom configuration property
  property: {
    // Property setters can be nested
    a: (value: string) => { },
    b: (value: string) => { }
  }
}

export default {
  resolvers,
  config,
  State
}
