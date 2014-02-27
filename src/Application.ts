module Knockbone {

    export class Application extends View {

        routes: any;
        router: Backbone.Router;

        start() {
            this._createRouter();

            Backbone.history.start();
        }

        /** Creates the router for this application */
        private _createRouter(): void {

            var routes = this.routes;

            if (routes) {

                var hasRoutes = false;
                var path, target;

                for (path in routes) {
                    if (routes.hasOwnProperty(path)) {

                        target = routes[path];

                        if (_.isString(target)) {
                            routes[path] = (() => {
                                var fn = this[target];

                                if (_.isFunction(fn)) {
                                    return () => fn.apply(this, arguments);
                                }
                            })();
                        }
                    }
                }

                this.router = new Backbone.Router({
                    routes: routes
                });
            }
        }

        /**
        * Renders a view in the specified container, or in the application's element if no container is specified.
        */
        renderView(view: View, container?: any): JQueryPromise<any> {

            if (!(view instanceof View))
                throw new Error("View is not an instance of Knockbone.View.");

            container = this._resolveContainer(container);

            var def = $.Deferred();

            if (view.isRendered)
                def.resolve();
            else
                view.renderAsync()
                    .done(() => def.resolve())
                    .fail(() => def.reject());

            def.done(() => container.html(view.el));

            return def.promise();
        }

        /**
        * Renders a template in the specified container, or in the application's element if no container is specified.
        */
        renderTemplate(template: any, container?: any): void {

            container = this._resolveContainer(container);
            template = this.getTemplate(template);

            Utils.when(template, () => container.html(template));
        }

        /**
        * Internal method - Gets the specified container element or this.$el if no container is specified.
        */
        private _resolveContainer(container?: any): any {
            if (container) {
                if (_.isString(container))
                    container = this.$(container);

                return container;
            }

            return this.$el;
        }
    }
}