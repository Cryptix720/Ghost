const _ = require('lodash');
const channelService = require('../channel');
const resourceDefaults = require('./default-config');

class Resource {
    constructor(name, options) {
        this.name = name;

        // Store the originally passed in options
        this._origOptions = _.cloneDeep(options) || {};
    }

    setRoute(route) {
        this.route = route.replace('{slug}', ':slug');
        // DO other things, to make it so that this route propagates
    }

    channel() {
        const options = resourceDefaults[this.name].channelConfig;

        return new channelService.Channel(this.name, options);
    }

}

// Resources are always present in the system, but they may not have URLs
module.exports.tag = new Resource('tag');
module.exports.author = new Resource('author');
