var path                = require('path'),
    express             = require('express'),
    _                   = require('lodash'),
    ampRouter           = express.Router(),
    i18n                = require('../../../i18n'),

    // Dirty requires
    errors              = require('../../../errors'),
    settingsCache       = require('../../../settings/cache'),
    templates           = require('../../../controllers/frontend/templates'),
    postLookup          = require('../../../controllers/frontend/post-lookup'),
    setResponseContext  = require('../../../controllers/frontend/context'),
    renderer            = require('../../../controllers/frontend/renderer'),

    templateName = 'amp',
    defaultTemplate = path.resolve(__dirname, 'views', templateName + '.hbs');

function _renderer(req, res, next) {
    // Renderer begin
    // Format data
    res.data = req.body || {};

    if (res.error) {
        res.data.error = res.error;
    }

    // Context
    // @TODO fix this!!
    setResponseContext(req, res, res.data);

    // Template
    // @TODO make a function that can do the different template calls
    res.locals.template = templates.pickTemplate(templateName, defaultTemplate);

    // Final checks, filters, etc...
    // DOES happen here, after everything is set, as the last thing before we actually render
    // Context check:
    // Our context must be ['post', 'amp'], otherwise we won't render the template
    // This prevents AMP from being rendered for pages
    // @TODO figure out a nicer way to determine this
    if (_.intersection(res.locals.context, ['post', 'amp']).length < 2) {
        return next();
    }

    // Render Call
    return renderer(req, res);
}

function getPostData(req, res, next) {
    req.body = req.body || {};

    postLookup(res.locals.relativeUrl)
        .then(function (result) {
            if (result && result.post) {
                req.body.post = result.post;
            }

            next();
        })
        .catch(function (err) {
            next(err);
        });
}

function checkIfAMPIsEnabled(req, res, next) {
    var ampIsEnabled = settingsCache.get('amp');

    if (ampIsEnabled) {
        return next();
    }

    // CASE: we don't support amp pages for static pages
    if (req.body.post && req.body.post.page) {
        return next(new errors.NotFoundError({message: i18n.t('errors.errors.pageNotFound')}));
    }

    /**
     * CASE: amp is disabled, we serve 404
     *
     * Alternatively we could redirect to the original post, as the user can enable/disable AMP every time.
     *
     * If we would call `next()`, express jumps to the frontend controller (server/controllers/frontend/index.js fn single)
     * and tries to lookup the post (again) and checks whether the post url equals the requested url (post.url !== req.path).
     * This check would fail if the site is setup on a subdirectory.
     */
    return next(new errors.NotFoundError({message: i18n.t('errors.errors.pageNotFound')}));
}

// AMP frontend route
ampRouter.route('/')
    .get(
        getPostData,
        checkIfAMPIsEnabled,
        _renderer
    );

module.exports = ampRouter;
module.exports.renderer = _renderer;
module.exports.getPostData = getPostData;
module.exports.checkIfAMPIsEnabled = checkIfAMPIsEnabled;
