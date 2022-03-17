import { Redis } from 'ioredis';

interface ManagerOptions {
  ttl?: number;
}

interface RedisStoreOptions extends ManagerOptions {
  redisInstance: Redis;
}

type Callback = (error: Error | null, result?: any) => void;

class RedisStore {
  private redisInstance: Redis;

  private ttlConfig?: number;

  constructor({ redisInstance, ttl }: RedisStoreOptions) {
    this.redisInstance = redisInstance;
    this.ttlConfig = ttl;
  }

  isCacheableValue = (value: any) => {
    return value !== null && value !== undefined;
  };

  get(key: string, options?: any, cb?: Callback) {
    if (typeof options === 'function') {
      cb = options;
    }
    const promise = this.redisInstance.get(key);
    return this.handleResponse(promise, cb, true);
  }

  set(key: string, value: any, options?: any, cb?: Callback) {
    if (!this.isCacheableValue(value)) {
      return;
    }
    value = JSON.stringify(value);

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    options ??= {};

    const ttl = options.ttl ?? this.ttlConfig;

    const promise =
      ttl !== undefined
        ? this.redisInstance.setex(key, ttl, value)
        : this.redisInstance.set(key, value);

    return this.handleResponse(promise, cb);
  }

  del(key: string, options?: any, cb?: Callback) {
    if (typeof options === 'function') {
      cb = options;
    }
    const promise = this.redisInstance.del(key);
    return this.handleResponse(promise, cb);
  }

  ttl(key: string, cb?: Callback) {
    const promise = this.redisInstance.ttl(key);
    return this.handleResponse(promise, cb);
  }

  private async handleResponse(
    promise: Promise<any>,
    cb: Callback | undefined,
    parse = false,
  ) {
    try {
      let value = await promise;
      if (parse) {
        value = JSON.parse(value);
      }
      cb?.(null, value);
      return value;
    } catch (error) {
      cb?.(error);
      throw error;
    }
  }
}

export default {
  create: (options: any) => new RedisStore(options),
};
