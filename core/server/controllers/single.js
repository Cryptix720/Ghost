var utils = require('../utils'),
    filters = require('../filters'),
    handleError = require('./frontend/error'),
    postLookup = require('./frontend/post-lookup'),
    renderPost = require('./frontend/render-post'),
    setRequestIsSecure = require('./frontend/secure');

module.exports = function singleController(req, res, next) {
    // Note: this is super similar to the config middleware used in channels
    // @TODO refactor into to something explicit
    res.locals.route = {
        type: 'single'
    };

    // Query database to find post
    return postLookup(req.path).then(function then(lookup) {
        // Format data 1
        var post = lookup ? lookup.post : false;

        if (!post) {
            return next();
        }

        // CASE: postlookup can detect options for example /edit, unknown options get ignored and end in 404
        if (lookup.isUnknownOption) {
            return next();
        }

        // CASE: last param is of url is /edit, redirect to admin
        if (lookup.isEditURL) {
            return utils.url.redirectToAdmin(302, res, '#/editor/' + post.id);
        }

        // CASE: permalink is not valid anymore, we redirect him permanently to the correct one
        if (post.url !== req.path) {
            return utils.url.redirect301(res, post.url);
        }

        setRequestIsSecure(req, post);

        filters.doFilter('prePostsRender', post, res.locals)
            .then(renderPost(req, res));
    }).catch(handleError(next));
};
