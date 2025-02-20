module.exports = {
  reactStrictMode: true,
  images: {
      domains: ['cdn-icons-png.flaticon.com'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: `${process.env.HOST_NAME}`,
          port: '',
          pathname: '/image/person/**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '8069',
          pathname: '/api/image/**',
        }
      ],
  },
  env: {
        JWT_SECRET: process.env.JWT_SECRET,
        NEXT_API_URL: process.env.NEXT_API_URL,
    },

  }