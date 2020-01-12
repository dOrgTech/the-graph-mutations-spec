import gql from "graphql-tag"
import { ethers } from "ethers"
import IPFSClient from "ipfs-http-client"
import { MutationState } from "@graphprotocol/mutations-ts"

export class State extends MutationState{
  public staticProperty = {};
}

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.graph.config

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

// TODO: remove ID at this level, pass it in using the uuid
async function sendTx(tx: any, msg: string, progress: number, context: any) {
  const state: MutationState = context.state;
  try {
    state.startTransaction({ title: msg, payload: {} })
    tx = await tx
    await tx.wait()
    state.confirmTransaction(progress, tx)
  } catch (error) {
    state.addError(error)
    throw new Error(`Failed while sending "${msg}"`)
  }
}

async function getGravityContract(context: any) {
  const { ethereum } = context.graph.config
  const abi = await context.graph.dataSources.Gravity.abi
  const address = await context.graph.dataSources.Gravity.address

  const contract = new ethers.Contract(
    address, abi, ethereum.getSigner()
  )
  contract.connect(ethereum)
  return contract
}

async function createGravatar(_root: any, {options}: any, context: any) {
  const { displayName, imageUrl } = options
  const gravity = await getGravityContract(context)
  const tx = gravity.createGravatar(displayName, imageUrl)
  await sendTx(tx, "Creating Gravatar", 0.9, context)
  return await queryUserGravatar(context)
}

async function updateGravatarName(_root: any, {displayName}: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.updateGravatarName(displayName)
  await sendTx(tx, "Updating Gravatar Name", 0.9, context)
  return await queryUserGravatar(context)
}

async function updateGravatarImage(_root: any, {imageUrl}: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.updateGravatarImage(imageUrl)
  await sendTx(tx, "Updating Gravatar Image", 0.9, context)

  // Example of custom data within the state
  context.graph.state.addData("imageUrl", imageUrl)

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
