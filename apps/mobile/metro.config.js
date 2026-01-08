// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add path alias resolution for ~/* to point to ../../src/*
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
    '~': path.resolve(__dirname, '../../src'),
  },
  // Block server-only dependencies and server code from being bundled
  blockList: [
    /node_modules\/@prisma\/.*/,
    /node_modules\/prisma\/.*/,
    // Note: @trpc/server is NOT blocked because @trpc/react-query needs 
    // @trpc/server/unstable-core-do-not-import. Server-side code in /src/server/ 
    // is already blocked separately below.
    // Block the entire server directory to prevent Metro from trying to bundle server-side code
    // This regex matches any path containing /src/server/
    /.*[\/\\]src[\/\\]server[\/\\].*/,
  ],
  // Resolve extensions including TypeScript
  sourceExts: [...config.resolver.sourceExts, 'ts', 'tsx'],
};

// Configure transformer
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;

