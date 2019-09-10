const cron = require('node-cron');

class Cron {
  constructor(cronFn = () => {}, bindTo = {}) {
    this.cronFn = cronFn.bind(bindTo);
    this.cron = {
      destroy() {},
      schedule() {}
    }
  }
  stop() {
    this.cron.destroy();
  }
  start(schedule, fn, bindTo = {}) {
    if (fn) this.cronFn = cronFn.bind(bindTo);
    this.cron.destroy();
    this.cron = cron.schedule(schedule, this.cronFn)
  }
}

module.exports = {
  Cron
}