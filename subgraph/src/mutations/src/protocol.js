const Gravity = require("../../../abis/Gravity");

function getGravityContract(web3, address) {
  return new web3.eth.Contract(Gravity.abi, address);
}

async function createGravatar(web3, address, options) {
  const gravity = getGravityContract(web3, address);
  return await gravity.methods.createGravatar(
    options.displayName, options.imageUrl
  ).send({ from: web3.eth.defaultAccount });
}

async function updateGravatarName(web3, address, displayName) {
  const gravity = getGravityContract(web3, address);
  return await gravity.methods.updateGravatarName(displayName)
    .send({ from: web3.eth.defaultAccount });
}

async function updateGravatarImage(web3, address, imageUrl) {
  const gravity = getGravityContract(web3, address);
  return await gravity.methods.updateGravatarImage(imageUrl)
    .send({ from: web3.eth.defaultAccount });
}

export {
  createGravatar,
  updateGravatarName,
  updateGravatarImage
}
