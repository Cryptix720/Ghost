/**
 * # Route Service
 *
 * Note: routes are patterns, not individual URLs, which have either
 * subrouters, or controllers mounted on them. There are not that many routes.
 *
 * The route service is intended to:
 * - keep track of the registered routes, and what they have mounted on them
 * - provide a way for apps to register routes
 * - expose base classes & registry to the rest of Ghost
 */

// Route Service settings are stored in content/settings/routes.yaml
module.exports.settings = require('./settings');

// This is the main router, that gets extended & mounted /site
module.exports.siteRouter = require('./site-router');

// We expose this via the App Proxy, so that Apps can register routes
module.exports.appRouter = require('./app-router');

module.exports.dynamicRouter = require('./router');

// Classes for other parts of Ghost to extend
module.exports.ParentRouter = require('./ParentRouter');

// Registry is where the live list of routes lives
module.exports.registry = require('./registry');
