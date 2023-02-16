const { initPubSub, subscribe } = require("warp-contracts-pubsub")
const {
  EvalStateResult,
  GQLNodeInterface,
  LoggerFactory,
  SortKeyCacheResult,
  Warp,
} = require("warp-contracts")
const { WarpPlugin, WarpPluginType } = require("warp-contracts")

const isNode = new Function(
  "try {return this===global;}catch(e){return false;}"
)
if (isNode) {
  global.WebSocket = require("ws")
}

class WarpSubscriptionPlugin {
  constructor(contractTxId, warp) {
    this.logger = LoggerFactory.INST.create("WarpSubscriptionPlugin")
    let last_attempt = Date.now()
    const connect = (attempt = 1) => {
      initPubSub()
      subscribe(
        `interactions/${contractTxId}`,
        async ({ data }) => {
          const message = JSON.parse(data)
          this.logger.debug("New message received", message)
          await this.process(message)
        },
        e => {
          console.log(e.error)
          console.log(`reconnecting in...${attempt} secs`)
          setTimeout(() => {
            const date = Date.now()
            connect(date - 1000 * 60 > last_attempt ? 1 : ++attempt)
            last_attempt = date
          }, 1000 * attempt)
        }
      )
        .then(() => {
          this.logger.debug("Subscribed to interactions for", this.contractTxId)
        })
        .catch(e => {
          this.logger.error("Error while subscribing", e)
        })
    }
    connect()
  }

  process(input) {}

  type() {
    return "subscription"
  }
}

class StateUpdatePlugin {
  async process(input) {
    const lastStoredKey = (
      await this.warp.stateEvaluator.latestAvailableState(this.contractTxId)
    )?.sortKey

    let result
    if (lastStoredKey?.localeCompare(input.lastSortKey) === 0) {
      this.logger.debug("Safe to use new interaction.", input.sortKey)
      result = await this.warp
        .contract(this.contractTxId)
        .readStateFor([input.interaction])
    } else {
      this.logger.debug(
        "Unsafe to use new interaction - reading the state via gateway",
        {
          lastSortKey: input.lastSortKey,
          localCache: lastStoredKey,
        }
      )
      result = await this.warp.contract(this.contractTxId).readState()
    }

    this.logger.debug("State updated", {
      sortKey: result.sortKey,
      state: result.cachedValue.state,
    })

    return result
  }
}

module.exports = { StateUpdatePlugin, WarpSubscriptionPlugin }
