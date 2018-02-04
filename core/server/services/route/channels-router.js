var _ = require('lodash'),
    routeSettings = require('./settings'),
    ParentRouter = require('./ParentRouter'),
    channelsService = require('../channels');

module.exports = function channelsRouter() {
    var channelsRouter = new ParentRouter('channels');

    _.each(routeSettings, function (controller, route) {
        var channel = channelsService.find(controller);

        if (channel) {
            channelsRouter.mountRouter(route, channelsService.router(channel));
        }
    });

    return channelsRouter.router();
};

