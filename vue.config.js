module.exports = {
  devServer: {
    proxy: {
      '/socket.io': {
        target: 'http://127.0.0.1:23333/socket.io',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
