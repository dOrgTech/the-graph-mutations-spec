const path = require("path");
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: "./src/index.ts",
  target: 'node',
  externals: [nodeExternals()],
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
