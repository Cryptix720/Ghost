const _ = require('lodash');
const routeSettings = require('./settings');
const ParentRouter = require('./ParentRouter');
const channelService = require('../channel');
const resourceService = require('../resource');
const settingsCache = require('../settings/cache');
const collections = [];

_.templateSettings.interpolate = /{([\s\S]+?)}/g;

class Collection {
    constructor(options) {
        this.baseRoute = options.baseRoute;
        // TODO: use this to generate post routes!
        this.entryRoute = Collection.resolve(options.route);
        this.template = options.template;

        this.query = _.pick(options, 'fields', 'filter', 'order_by', 'limit');
    }

    channel() {
        const name = Collection.routeToName(this.baseRoute);
        const options = {
            postOptions: this.query
        };

        return new channelService.Channel(name, options);
    }

    static routeToName(route) {
        if (route === '/') {
            return 'index';
        }

        return route.replace(/\//g, '');
    }

    static resolve(value) {
        // @TODO figure out how to do this properly
        const settings = {
            globals: {
                permalinks: settingsCache.get('permalinks')
            }
        };

        return _.template(value)(settings);
    }
}

function resolveCollections(settings) {
    _.each(settings, (value, key) => {
        value.baseRoute = key;
        collections.push(new Collection(value));
    });
}

module.exports = function router() {
    const dynamicRouter = new ParentRouter('routeService');

    // TODO: do something with routes
    resolveCollections(routeSettings.collections);

    _.each(collections, (collection) => {
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
