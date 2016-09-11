const _ = require('lodash');
const config = require('./src/config');
const Router = require('./src/router');
const Module = require('./src/module');
const Render = require('./src/render');
const debug = require('debug')('brick:index');

var brick = {
    engine: (type, engine) => Render.register(type, engine),
};

module.exports = function(cfg) {
    cfg = config.factory(cfg);
    debug('config loaded:', JSON.stringify(cfg, null, 4));

    var m = Module();
    var modules = m.loadAll(cfg);
    var router = Router(cfg);
    var rootModules = modules.filter(mod => mod.router.url);

    debug(`found ${modules.length} modules, ${rootModules.length} root`);

    router.mountModules(rootModules);

    var brk = Object.create(brick);
    brk.root = cfg.root;
    brk.express = router.express();
    brk.expressCatch404 = router.expressCatch404;
    brk.expressErrorHandler = function(conf) {
        conf = conf || {};
        var mod = conf.brick || 'error';
        return router.expressErrorHandler(m.get(mod));
    };

    return brk;
};
