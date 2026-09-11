const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Metro defaults to watching only the app folder, so workspace packages and
// root-hoisted dependencies are invisible without these two settings.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Hierarchical lookup stays ON deliberately. Disabling it is a common monorepo
// suggestion, but it stops Metro walking into nested node_modules — which
// breaks any package relying on its own pinned copy of a dependency that the
// root hoisted at a different major (react-native-reanimated needs semver 7
// while the root tree hoists semver 6).

module.exports = withNativeWind(config, { input: "./src/global.css" });
