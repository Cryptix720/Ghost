var debug = require('ghost-ignition').debug('site:routes'),

    routeService = require('../../services/route'),
    siteRouter = routeService.siteRouter,

    // Sub Routers
    appRouter = routeService.appRouter,

    // Controllers
    controllers = require('../../controllers'),

    // Utils for creating paths
    // @TODO: refactor these away
    config = require('../../config'),
    urlService = require('../../services/url');

module.exports = function siteRoutes() {
    // @TODO move this path out of this file!
    // Note this also exists in api/events.js
    var previewRoute = urlService.utils.urlJoin('/', config.get('routeKeywords').preview, ':uuid', ':options?');

    // Preview - register controller as route
    // Ideal version, as we don't want these paths all over the place
    // previewRoute = new Route('GET /:t_preview/:uuid/:options?', previewController);
    // siteRouter.mountRoute(previewRoute);
    // Orrrrr maybe preview should be an internal App??!
    siteRouter.mountRoute(previewRoute, controllers.preview);

    // Dynamic Route Service Router
    // Based on routes.yaml
    siteRouter.mountRouter(routeService.dynamicRouter());

    // Apps - register sub-router
    // The purpose of having a parentRouter for apps, is that Apps can register a route whenever they want.
    // Apps cannot yet deregister, it's complex to implement and I don't yet have a clear use-case for this.
    siteRouter.mountRouter(appRouter.router());

    // @TODO rewrite entry route handling
    // Default - register entry controller as route
    siteRouter.mountRoute('*', controllers.entry);

    debug('Routes:', routeService.registry.getAll());
    console.log('Routes:', routeService.registry.getAll());

    return siteRouter.router();
};
