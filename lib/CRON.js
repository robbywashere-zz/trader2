const cron = require('node-cron');

class Cron {
    constructor(cronFn, ctx = {}) {
        this.ctx = ctx;
        this.cronFn = () => cronFn(this.ctx);
        this.cron = {
            destroy() {},
            schedule() {},
        };
    }
    stop() {
        this.cron.destroy();
    }
    setCtx(ctx) {
        this.ctx = { ...this.ctx, ...ctx };
        return this;
    }
    start(schedule, ctx) {
        if (ctx) this.ctx = { ...this.ctx, ...ctx };
        this.cron.destroy();
        this.cron = cron.schedule(schedule, this.cronFn);
    }
}

module.exports = {
    Cron,
};
