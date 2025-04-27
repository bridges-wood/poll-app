//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const withBundleAnalyzer = require('@next/bundle-analyzer');
const { promisify } = require('util');
const { exec } = require('child_process');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost'],
    },
  },
  generateBuildId: async () => {
    // For example get the latest git commit hash here
    const { stdout, stderr } = await promisify(exec)('git rev-parse HEAD');
    if (!stdout) throw new Error(stderr);

    return stdout.trim();
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withBundleAnalyzer({
    openAnalyzer: false,
    enabled: process.env.ANALYZE === 'true',
  }),
];

module.exports = composePlugins(...plugins)(nextConfig);
