const path = require("path");

module.exports = {
  entry: "./src/index",
  target: "node",
  output: {
    library: 'Resolvers',
    filename: "index.js",
    path: path.resolve(__dirname, "bundle"),
    libraryTarget: 'umd',
    globalObject: "this"
  },
  resolve: {
    extensions: ["*", ".json", ".ts", ".js"]
  },
  module: {
    rules: [
      // note that babel-loader is configured to run after ts-loader
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { forceAllTransforms: true }]
              ],
              plugins: ["add-module-exports"]
            }
          },
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                outDir: path.resolve(__dirname, "bundle")
              }
            }
          }
        ]
      }
    ]
  }
};
