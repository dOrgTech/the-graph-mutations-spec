const path = require("path");

module.exports = {
  entry: "./src/index",
  output: {
    library: 'Resolvers',
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: 'umd',
    globalObject: "this"
  },
  module: {
    rules: [
      // note that babel-loader is configured to run after ts-loader
      {
        test: /\.(ts|js)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["env"],
              plugins: ["add-module-exports"]
            }
          },
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};
