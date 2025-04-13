module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel", 
      "react-native-reanimated/plugin",
      // Suppress defaultProps warning from FirebaseRecaptcha
      ["transform-remove-console", {
        exclude: ["error", "log", "info"],
        // This filter targets only the defaultProps warning from FirebaseRecaptcha
        // while preserving all other console outputs
        filter: {
          warning: [
            "Support for defaultProps will be removed from function components in a future major release",
          ],
        },
      }],
    ],
  };
};
