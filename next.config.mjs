// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-wallets',
      '@solana/wallet-adapter-react-ui'
    ]
  }
  
  export default nextConfig
