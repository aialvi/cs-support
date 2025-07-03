const path = require("path");
const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(defaultConfig, {
	entry: {
		admin: path.resolve(process.cwd(), "src/admin/admin.js"),
		"create-ticket": path.resolve(process.cwd(), "src/admin/create-ticket.js"),
		tickets: path.resolve(process.cwd(), "src/admin/tickets.js"),
		"team-management": path.resolve(process.cwd(), "src/admin/team-management.js"),
		faq: path.resolve(process.cwd(), "src/admin/faq.js"),
		settings: path.resolve(process.cwd(), "src/admin/settings.js"),
	},
	output: {
		path: path.resolve(process.cwd(), "build/admin"),
		filename: "[name].js",
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css",
		}),
	],
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx"],
	},
});
