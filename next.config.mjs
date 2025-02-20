/** @type {import('next').NextConfig} */
const nextConfig = {};

// Import the bundle analyzer
import withBundleAnalyzer from '@next/bundle-analyzer';

// Configure the bundle analyzer
const analyzerConfig = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

// Export the configuration
export default analyzerConfig(nextConfig);