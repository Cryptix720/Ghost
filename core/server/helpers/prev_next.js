// ### prevNext helper exposes methods for prev_post and next_post - separately defined in helpers index.
//  Example usages
// `{{#prev_post}}<a href ="{{url}}>previous post</a>{{/prev_post}}'
// `{{#next_post}}<a href ="{{url absolute="true">next post</a>{{/next_post}}'

var proxy = require('./proxy'),
    Promise = require('bluebird'),

    api = proxy.api,
    isPost = proxy.checks.isPost,

    fetch;

fetch = function fetch(apiOptions, options) {
    return api.posts.read(apiOptions).then(function (result) {
        var related = result.posts[0];

        if (related.previous) {
            return options.fn(related.previous);
        } else if (related.next) {
            return options.fn(related.next);
        } else {
            return options.inverse(this);
        }
    });
};

// If prevNext method is called without valid post data then we must return a promise, if there is valid post data
// then the promise is handled in the api call.

module.exports = function prevNext(options) {
    options = options || {};

    console.log('OPTIONS', options.data.root);

    var apiOptions = {
        include: options.name === 'prev_post' ? 'previous,previous.author,previous.tags' : 'next,next.author,next.tags'
    };

    if (options.hash && options.hash.channel) {
        console.log('USE CHANNEL FILTER!');
        apiOptions.channel = options.hash.channel;
    }

    if (isPost(this) && this.status === 'published') {
        apiOptions.slug = this.slug;
        return fetch(apiOptions, options);
    } else {
        return Promise.resolve(options.inverse(this));
    }
};
