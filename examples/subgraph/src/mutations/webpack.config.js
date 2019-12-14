const path = require("path");

module.exports = {
  entry: "./src/index",
  output: {
    library: 'Resolvers',
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      // note that babel-loader is configured to run after ts-loader
      {
        test: /\.(ts|js)$/,
        loader: "babel-loader?presets[]=env!ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};
