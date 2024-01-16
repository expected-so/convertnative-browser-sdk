const { resolve } = require('path')
const TerserPlugin = require('terser-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
	mode: isProduction ? 'production' : 'development',
	target: 'web',
	devtool: 'source-map',
	experiments: {
		outputModule: true,
	},
	entry: {
		index: {
			import: resolve(__dirname, 'src/index.ts'),
			library: {
				type: 'module',
			},
		},
		browser: {
			import: resolve(__dirname, 'src/browser.ts'),
		},
		'service-worker': {
			import: resolve(__dirname, 'src/service-worker.ts'),
		},
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	output: {
		path: resolve(__dirname, 'dist'),
		filename: '[name].js',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	optimization: {
		moduleIds: 'deterministic',
		minimize: isProduction,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					mangle: false,
					compress: false,
					output: {
						comments: false,
					},
				},
			}),
		],
	},
}
