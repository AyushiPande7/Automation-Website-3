class Mutex {
  constructor() {
    this.locks = new Map();
  }

  async acquire(key) {
    while (this.locks.get(key)) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    this.locks.set(key, true);
  }

  release(key) {
    this.locks.delete(key);
  }

  async runExclusive(key, cb) {
    await this.acquire(key);
    try {
      return await cb();
    } finally {
      this.release(key);
    }
  }
}

module.exports = new Mutex();
