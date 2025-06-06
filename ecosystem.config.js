module.exports = {
  apps: [{
    name: 'tegnogfarge',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/tegnogfa/public_html',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
} 