const _ = require('lodash');
const routeSettings = require('./settings');
const ParentRouter = require('./ParentRouter');
const channelService = require('../channel');
const resourceService = require('../resource');
const collectionService = require('../collection');

module.exports = function router() {
    const dynamicRouter = new ParentRouter('routeService');

    // TODO: do something with routes!

    _.each(routeSettings.collections, (options, key) => {
        const collection = new collectionService.Collection(key, options);
        dynamicRouter.mountRouter(collection.baseRoute, channelService.router(collection.channel()));
    });

    _.each(routeSettings.resources, (route, name) => {
        const resource = resourceService.registry[name];
        // Set a route on the resource, informs Ghost where to render this resource
        resource.setRoute(route);
        dynamicRouter.mountRouter(resource.route, channelService.router(resource.channel()));
    });

    return dynamicRouter.router();
};
