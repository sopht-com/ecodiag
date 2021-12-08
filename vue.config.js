module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/' + process.env.CI_PROJECT_NAME + process.env.ECODIAG_TARGET_PATH
    : './'
}
