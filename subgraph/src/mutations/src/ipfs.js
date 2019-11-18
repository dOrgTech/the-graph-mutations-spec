import IPFSClient from "ipfs-http-client"
const ipfs = undefined;

export function setIPFSProvider(provider) {
  ipfs = IPFSClient(provider)
}

export default ipfs
