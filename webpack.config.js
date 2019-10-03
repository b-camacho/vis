const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'bubbles': './sources/js/visualisations/bubbles.js',
    'collab': './sources/js/visualisations/collab.js',
    'google-map': './sources/js/visualisations/google-map.js',
    'research-map': './sources/js/visualisations/research-map.js',
    'wordcloud': './sources/js/visualisations/wordcloud.js',
    'works': './sources/js/visualisations/works.ts',
    'group-bubbles': './sources/js/group-visualisations/bubbles.js',
    'group-collab': './sources/js/group-visualisations/collab.ts',
    'group-google-map': './sources/js/group-visualisations/google-map.js',
    'group-research-map': './sources/js/group-visualisations/research-map.js',
    'group-wordcloud': './sources/js/group-visualisations/wordcloud.js',
    'group-works': './sources/js/group-visualisations/works.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  // outDir: path.resolve(__dirname, \'dist\'),
  output: {
    path: path.resolve(__dirname, 'dist')
  }
};
