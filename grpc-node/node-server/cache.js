const { isNil } = require('ramda');

var REDIS_TTL = 3600;
class Cache {
  constructor(config) {
    this.cache = {};
    if (!isNil(config.redis)) {
      const { createClient } = require('redis');
      this.redis = createClient(config.redis);
    }
  }

  async init() {
    if (!isNil(this.redis)) {
      try {
        await this.redis.connect();
        console.log('redis is ready!');
        this.isRedis = true;
      } catch (e) {
        console.log(e);
        console.log('redis error');
      }
    }
  }

  async get(key) {
    if (this.isRedis) {
      try {
        const _ret = await this.redis.get(key);
        if (_ret) {
          const ret = JSON.parse(_ret)
          if (ret) return ret;
        }
      } catch (e) {
        console.log(e);
      }
      return null;
    } else {
      return this.cache[key];
    }
  }

  async set(key, val, ttl=REDIS_TTL) {
    if (this.isRedis) {
      try {

        await this.redis.set(key, JSON.stringify(val));
        await this.redis.expire(key, ttl);
      } catch (e) {
        console.log(e);
        console.log("key: ", key)
        console.log("val: ", val)
      }
    } else {
      this.cache[key] = val;
    }
  }

  async exists(key) {
    if (this.isRedis) {
      try {
        return (await this.redis.exists(key)) === 1;
      } catch (e) {}
      return false;
    } else {
      return !isNil(this.cache[key]);
    }
  }


}

module.exports = Cache;
