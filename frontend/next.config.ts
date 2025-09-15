import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  /* Scope Turbopack to this package to avoid picking repo-root middleware/config */
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
