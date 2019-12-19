import gql from "graphql-tag"
import { ethers } from "ethers"
import IPFSClient from "ipfs-http-client"

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.config

  return await client.query(gql`
  {
    gravatar(owner: ${ethereum.eth.defaultAccount}) {
      id
      owner
      displayName
      imageUrl
    }
  }`)
}

async function sendTx(tx: any, msg: string, context: any) {
  const { mutationState } = context.thegraph
  try {
    tx = await tx
    mutationState.addTransaction(tx.hash)
    await tx.wait()
  } catch (error) {
    mutationState.addError(error)
    throw new Error(`Failed while sending "${msg}"`)
  }
}

function getGravityContract(context: any) {
  const { ethereum } = context.thegraph.config
  const { Gravity } = context.thegraph.dataSources

  const contract = new ethers.Contract(
    Gravity.address, Gravity.abi, ethereum
  )
  contract.connect(ethereum)
  return contract
}

async function createGravatar(_root: any, {options}: any, context: any) {
  const { displayName, imageUrl } = options
  const gravity = getGravityContract(context)
  // const tx = gravity.createGravatar(displayName, imageUrl)

  await gravity.createGravatar(displayName, imageUrl);
  // await sendTx(tx, "Creating Gravatar", context)
  return await queryUserGravatar(context)
}

async function updateGravatarName(_root: any, {displayName}: any, context: any) {
  const gravity = getGravityContract(context)
  const tx = gravity.updateGravatarName(displayName)

  await sendTx(tx, "Updating Gravatar Name", context)
  return await queryUserGravatar(context)
}

async function updateGravatarImage(_root: any, {imageUrl}: any, context: any) {
  const gravity = getGravityContract(context)
  const tx = gravity.updateGravatarImage(imageUrl)

  // Example of custom data within the state
  context.thegraph.mutationState.addData("imageUrl", imageUrl)

  await sendTx(tx, "Updating Gravatar Image", context)
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
  config
}
