/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${
          process.env.API_URL || 'http://localhost:8787'
        }/api/:path*`
      }
    ]
  }
}

export default nextConfig
