export default {
  webpack(config, { isServer }) {
    if (!isServer) {
      // Replace the 'fs' module with a no-op module for client-side builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Disable 'fs' for client-side
      };
    }
    return config;
  },
};
