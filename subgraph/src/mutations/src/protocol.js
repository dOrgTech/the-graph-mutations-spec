import web3 from "./web3"

const Gravity = require("../../../abis/Gravity");
let gravitySC = null;

function getGravityContract() {
  if (!gravitySC) {
    const { address } = require("../../../build/address.json");
    gravitySC = new web3.eth.Contract(Gravity.abi, address)
  }

  return gravitySC;
}

async function createGravatar(options) {
  const gravity = getGravityContract();
  return await gravity.methods.createGravatar(
    options.displayName, options.imageUrl
  ).send({ from: web3.eth.defaultAccount });
}

async function updateGravatarName(displayName) {
  const gravity = getGravityContract();
  return await gravity.methods.updateGravatarName(displayName)
    .send({ from: web3.eth.defaultAccount });
}

async function updateGravatarImage(imageUrl) {
  const gravity = getGravityContract();
  return await gravity.methods.updateGravatarImage(imageUrl)
    .send({ from: web3.eth.defaultAccount });
}

export {
  createGravatar,
  updateGravatarName,
  updateGravatarImage
}
