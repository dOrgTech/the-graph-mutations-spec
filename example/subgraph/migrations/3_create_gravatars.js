const fs = require('fs')
const yaml = require('yaml')
const GravatarRegistry = artifacts.require('./GravatarRegistry.sol')

module.exports = async function(deployer) {
  const registry = await GravatarRegistry.deployed()

  console.log('Registry address:', registry.address)

  let manifest = yaml.parse(fs.readFileSync(__dirname + '/../subgraph.yaml', 'utf-8'))

  for (let i = 0; i < manifest.dataSources.length; ++i) {
    const dataSource = manifest.dataSources[i]

    if (dataSource.name === "Gravity") {
      dataSource.source.address = registry.address
      break
    }
  }

  fs.writeFileSync(
    __dirname + '/../subgraph.yaml',
    yaml.stringify(manifest)
  )

  let accounts = await web3.eth.getAccounts()
  await registry.createGravatar('Carl', 'https://thegraph.com/img/team/team_04.png', {
    from: accounts[0],
  })
  await registry.createGravatar('Lucas', 'https://thegraph.com/img/team/bw_Lucas.jpg', {
    from: accounts[1],
  })
}
