const path = require("path");
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: "./src/index.ts",
  target: 'node',
  externals: {
    "graphql-tag" : "gql",
    "web3": "Web3",
    "ipfs-http-client": "IPFSClient"
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.ts'],
  },
  output: {
    library: 'Resolvers',
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: 'umd'
  }
};
