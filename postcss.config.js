module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // CSS minification for production builds
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: 'default',
      },
    }),
  },
}; 