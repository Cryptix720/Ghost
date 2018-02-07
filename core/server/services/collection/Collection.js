const _ = require('lodash');
const channelService = require('../channel');
const settingsCache = require('../settings/cache');

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

module.exports = Collection;
