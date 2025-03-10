const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const pluginDir = path.resolve(__dirname, "..");
const buildDir = path.resolve(pluginDir, "dist");
const pluginSlug = "cs-support";

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
	fs.mkdirSync(buildDir);
}

// Build assets
exec("npm run build", { cwd: pluginDir }, (error) => {
	if (error) {
		console.error("Error building assets:", error);
		return;
	}

	// Files/directories to include
	const includes = [
		"build",
		"includes",
		"vendor",
		"cs-support.php",
		"readme.txt",
		"LICENSE",
	];

	// Create zip file
	exec(
		`cd "${pluginDir}" && zip -r "${buildDir}/${pluginSlug}.zip" ${includes.join(
			" ",
		)}`,
		(error) => {
			if (error) {
				console.error("Error creating zip:", error);
				return;
			}
			console.log(`Plugin zip created at: ${buildDir}/${pluginSlug}.zip`);
		},
	);
});
