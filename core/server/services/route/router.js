var _ = require('lodash'),
    routeSettings = require('./settings'),
    ParentRouter = require('./ParentRouter'),
    settingsCache = require('../settings/cache'),
    channelsService = require('../channel'),
    resourceService = require('../resource'),
    routes = [],
    collections = [];

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

        return new channelsService.Channel(name, options);
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

function resolveRoutes(settings) {
    // console.log('Got Routes:', settings);
}

function resolveCollections(settings) {
    _.each(settings, (value, key) => {
        value.baseRoute = key;
        collections.push(new Collection(value));
    });
}

function resolveResources(settings) {
    // console.log('Got Resources:', settings);
}

module.exports = function router() {
    var dynamicRouter = new ParentRouter('routeService');

    resolveRoutes(routeSettings.routes);
    resolveCollections(routeSettings.collections);
    resolveResources(routeSettings.resources);

    _.each(collections, (collection) => {
        dynamicRouter.mountRouter(collection.baseRoute, channelsService.router(collection.channel()));
    });

    _.each(routeSettings.resources, (route, name) => {
        const resource = resourceService.registry[name];
        // Set a route on the resource, informs Ghost where to render this resource
        resource.setRoute(route.replace('{slug}', ':slug'));
        dynamicRouter.mountRouter(resource.route, channelsService.router(resource.channel()));
    });

    return dynamicRouter.router();
};
