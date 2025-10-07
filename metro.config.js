const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'cjs', 'mjs', 'json'];

module.exports = config;