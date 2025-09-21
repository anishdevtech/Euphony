// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'nativewind/babel', // NativeWind
    'react-native-reanimated/plugin', // Reanimated plugin must be last
  ],
};
