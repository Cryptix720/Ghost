var _ = require('lodash'),
    routeSettings = require('./settings'),
    ParentRouter = require('./ParentRouter'),
    settingsCache = require('../settings/cache'),
    channelsService = require('../channels'),
    routes = [],
    collections = [],
    resources = [];

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
        const options = {
            name: Collection.routeToName(this.baseRoute),
            postOptions: this.query
        };

        return new channelsService.Channel(options);
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

    console.log('Collections', collections);

    _.each(collections, (collection) => {
        dynamicRouter.mountRouter(collection.baseRoute, channelsService.router(collection.channel()));
    });

    return dynamicRouter.router();
};
