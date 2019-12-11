const webpack = require("webpack")
const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  target: 'node',
  externals: ["fs", "bindings", "any-promise"],
  resolve: {
    extensions: ['*', '.js', '.ts'],
    alias: {
      'scrypt.js': path.resolve(__dirname, './node_modules/scrypt.js/js.js'),
      'swarm-js': path.resolve(__dirname, './node_modules/swarm-js/lib/api-browser.js'),
      'fs': path.resolve(__dirname, './src/app/fs-fake.js'),
    }
  },
  plugins: [
    new webpack.IgnorePlugin(/^(?:electron|ws)$/)
  ],
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
  output: {
    library: 'Resolvers',
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: 'umd'
  }
};
