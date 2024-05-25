const { WarpPlugin } = require("warp-contracts")

module.exports = class FetchOptionsPlugin {
  constructor(apiKey) {
    this.apiKey = apiKey
  }
  process(request) {
    const url = request.input

    let fetchOptions = {}

    if (
      url == `https://d1o5nlqr4okus2.cloudfront.net/gateway/sequencer/register`
    ) {
      fetchOptions = { keepalive: true }
    }
    if (this.apiKey) {
      fetchOptions.headers = request.init.headers ?? {}
      fetchOptions.headers["x-api-key"] = this.apiKey
    }
    return fetchOptions
  }

  type() {
    return "fetch-options"
  }
}
