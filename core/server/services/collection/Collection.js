const _ = require('lodash');
const channelService = require('../channel');
const settingsCache = require('../settings/cache');

_.templateSettings.interpolate = /{([\s\S]+?)}/g;

class Collection {
    constructor(key, options) {
        // Set this.baseRoute & this.name
        this.handleRouteKey(key);
        // TODO: use this to generate post routes!
        this.entryRoute = Collection.resolve(options.route);
        this.template = options.template;

        this.query = _.pick(options, 'fields', 'filter', 'order_by', 'limit');
    }

    channel() {
        // @TODO custom template & context support
        // @TODO Pagination & RSS support
        const options = {
            postOptions: this.query
        };

        return new channelService.Channel(this.name, options);
    }

    handleRouteKey(key) {
        if (key === '/') {
            this.name = 'index';
            this.baseRoute = '/';
        } else {
            this.name = key.replace(/^\/|\/$/g, '');
            this.baseRoute = `/${this.name}/`;
        }
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
            slug: ':slug',
            globals: {
                permalinks: settingsCache.get('permalinks')
            }
        };

        return _.template(value)(settings);
    }
}

module.exports = Collection;
