const Gravity = require("../../../abis/Gravity");
const { address } = require("../../../build/address.json");

function getGravityContract(web3) {
  return new web3.eth.Contract(Gravity.abi, address);
}

async function createGravatar(web3, options) {
  const gravity = getGravityContract(web3);
  return await gravity.methods.createGravatar(
    options.displayName, options.imageUrl
  ).send({ from: web3.eth.defaultAccount });
}

async function updateGravatarName(web3, displayName) {
  const gravity = getGravityContract(web3);
  return await gravity.methods.updateGravatarName(displayName)
    .send({ from: web3.eth.defaultAccount });
}

async function updateGravatarImage(web3, imageUrl) {
  const gravity = getGravityContract(web3);
  return await gravity.methods.updateGravatarImage(imageUrl)
    .send({ from: web3.eth.defaultAccount });
}

export {
  createGravatar,
  updateGravatarName,
  updateGravatarImage
}
