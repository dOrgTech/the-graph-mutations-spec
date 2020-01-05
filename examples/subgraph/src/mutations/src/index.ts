import gql from "graphql-tag"
import { ethers } from "ethers"
import IPFSClient from "ipfs-http-client"

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.thegraph.config

  return await client.query({
    query: gql`
    query gravatars($owner: String!){
      gravatars (where:{owner: $owner}) @client {
        id
        owner
        displayName
        imageUrl
      }
    }`,
    variables: {
      owner: ethereum.provider.selectedAddress
    }
  })
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

async function getGravityContract(context: any) {
  const { ethereum } = context.thegraph.config
  const datasource = await context.thegraph.dataSources.find(async dataSource => await dataSource.name === "Gravity")
  const datasourceAbi = await datasource.abi
  const dataSourceAddress = await datasource.address
  const [file] = await context.thegraph.config.ipfs.get(datasourceAbi)

  const abi = file.content.toString('utf8')

  const contract = new ethers.Contract(
    dataSourceAddress, abi, ethereum.getSigner()
  )
  contract.connect(ethereum)
  return contract
}

async function createGravatar(_root: any, {options}: any, context: any) {
  const { displayName, imageUrl } = options
  const gravity = await getGravityContract(context)
  const tx = await gravity.createGravatar(displayName, imageUrl)
  console.log(tx)
  await sendTx(tx, "Creating Gravatar", context)
  return await queryUserGravatar(context)
}

async function updateGravatarName(_root: any, {displayName}: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = await gravity.updateGravatarName(displayName)
  console.log(tx)
  console.log(context)

  //await sendTx(tx, "Updating Gravatar Name", context)
  return await queryUserGravatar(context)
}

async function updateGravatarImage(_root: any, {imageUrl}: any, context: any) {
  const gravity = await getGravityContract(context)
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
