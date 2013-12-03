module Knockbone {

    interface EventInfo {
        eventName: string;
        methodName: string;
        method: any;
        selector: string;
        adapter: string;
        filters: string[];
    }

    interface ParsedEventInfo {
        el?: EventInfo[];
        direct?: EventInfo[];
        window?: EventInfo[];
        document?: EventInfo[];
    }

    interface ChildViewDefinition {
        instance?: any;
        container?: string;
        view: any;
    }

    // Regex to split the event name
    var delegateEventSplitter = /^(?:\((.*)\)\s*)?(\S+)\s*(.*)$/;

    // Regex to split the event action
    var actionMethodSplitter = /^(?:(.+)\?\s*)?(?:(\S+)\s*=>\s*)?(.*)$/;

    // Regex to get the event handler filters
    var actionFilterSplitter = /(\w+)(?:\s*\|\s*)?/g;

    // Template Cache
    export var TemplateCache = {};

    export class View extends Backbone.View {

        constructor(options?: Backbone.ViewOptions) {
            super(options);

            if (options && options.el)
                this._ownsElement = true;

            this._allowDelegateEvents = true;
        }

        /**
        * View events are objects in the form of:
        * 
        * {
        *    "[(scope)] event selector" : "[filter | filterN... ?] [adapter =>] methodName",
        *    ...
        * }
        * 
        * "scope" controls where the event is delegated. If ommitted, the default is to delegate
        * the event to the view element (Backbone's default). The scope can also be set to
        * window, document or element. In the case of element, the event handler is attached to the
        * target element itself.
        *
        * "filter" are or more filters, where if any of them is true, will run the event handler.
        * "adapter" is a converter that will handle the parameters and convert them to some other 
        * format.
        *
        * For example:
        *
        *  {
        *      "click .btn1" : "handleClick",
        *      "click .btn2" : e => this.handleClick(e), // similar to the previous one
        *      "keyUp #someinput" : "keyEnter ? value => handleEnter"
        *      "(window) resize" : "resizeView", // attaches the handler to window
        *      "(document) click" : "handleDocumentClick", // attaches the handler to the document object
        *      "(direct) click #someid" "handleDirectClick" // attaches the handler to the target element
        *  }
        */
        events: any;

        /**
        * The 'views' member allow for nesting views automatically.
        * {
        *    childView1 : { view: SomeChildView, container: "#selector" },
        *    childView2 : { view: () => new SomeChildView(), container: "#selector" }
        * }
        *
        * Once the view is created during "render", the view is attached to "this" using its name,
        * so it can be accessed as "this.childView1", "this.childView2", etc.
        */
        views: any;

        /** The template to be used with the view, if any. Can be a string, a selector or a promise to a string.*/
        template: any;

        private _usedTemplate: boolean;
        private _ownsElement: boolean;

        triggerMethod: typeof Knockbone.triggerMethod;

        /** Flag that indicates if the view has already been rendered. */
        isRendered = false;

        /** Workaround flag to prevent event delegation before the class is created */
        private _allowDelegateEvents = false;

        /** Renders the view and returns "this", for compatibility with backbone */
        render(): View {
            this.renderAsync();
            return this;
        }

        /** renderAsync does the actual rendering of the template and apply the knockout bindings */
        renderAsync(): JQueryPromise<any> {
            if (this.isRendered)
                return $.when();

            var def = $.Deferred();

            var beforeRender = this.triggerMethod(['beforeRender', 'onBeforeRender']);

            this._createChildViews();

            Utils.when(beforeRender, () => {

                var template = this.getTemplate();
                var viewModel = this.getViewModel();

                Utils.when(template, (template) => {

                    this.triggerMethod(['beforeRenderTemplate', 'onBeforeRenderTemplate']);

                    if (template) {
                        this.$el.html(template);
                        this._usedTemplate = true;
                    }

                    this.triggerMethod(['renderTemplate', 'onRenderTemplate']);

                    Utils.when(viewModel, (viewModel) => {

                        this.triggerMethod(['beforeApplyBindings', 'onBeforeApplyBindings']);

                        if (viewModel)
                            ko.applyBindings(viewModel, this.el);

                        this.triggerMethod(['applyBindings', 'onApplyBindings']);

                        this.triggerMethod(['beforeRenderChildren', 'onBeforeRenderChildren']);

                        var childrenRendered = this._renderChildViews();

                        Utils.when(childrenRendered, () => {

                            this.triggerMethod(['renderChildren', 'onRenderChildren']);

                            this.delegateEvents();

                            this.triggerMethod(['render', 'onRender']);

                            this._triggerDomInsert();

                            this.isRendered = true;

                            def.resolve();
                        });
                    });
                });
            });

            return def.promise();
        }

        private _createChildViews() : void {

            if (this.views) {
                _.each(this.views, (def: ChildViewDefinition, name: string) => {
                    var view = new def.view();

                    def.instance = view;

                    if (this[name] === undefined)
                        this[name] = view;
                });
            }
        }

        private _renderChildViews() : JQueryPromise<any> {

            if (this.views) {

                var promises = [];

                _.each(this.views, (def: ChildViewDefinition) => {

                    var view = def.instance;

                    if (def.instance instanceof View) {
                        promises.push(view.renderAsync());

                        var container = def.container;

                        if (container)
                            this.$(container).html(view.el);
                    }
                });

                return $.when.apply(null, promises);
            }

            return null;
        }

        private _triggerDomInsert() {

            var methodName = 'onDOMInsert';

            if (this[methodName]) {

                var docElement = document.documentElement;
                var el = this.el;

                var checkDOM = () => {

                    if ($.contains(docElement, el))
                        this.triggerMethod(['dominsert', methodName]);
                    else
                        setTimeout(checkDOM, 10);
                };

                checkDOM();
            }
        }

        /**
        * Gets the template from "this.template" as a string or a promise to a string.
        */
        getTemplate(template?: any): any {

            template = template || _.result(this, "template");

            if (template) {

                if (Utils.isUrl(template))
                    return this._getTemplateFromUrl(template);

                if (Utils.isPromise(template))
                    return template;

                return $(template).html();
            }
            
            return null;
        }

        /**
        * Gets a viewmodel to apply with knockout's applyBindings.
        * By default, this method will create a viewmodel from the view itself, using any member where:
        * - The name does not start with an underscore
        * - The value is a Model, Collection or observable
        * In the case of Models and Collections, it will call '.observable()' on them to get the observable versions of them
        */
        getViewModel(): any {

            var keys = [];

            _.each(this, (value: any, key: string) => {
                if (key.charAt(0) !== '_' && (value instanceof Model || value instanceof Collection || ko.isObservable(value)))
                    keys.push(key);
            });

            return this.createViewModel(keys, this);
        }

        /**
        * Creates a viewModel from an object by extracting its keys and converting the values if necessary.
        * This method creates observables for Models and Collections and binds any methods. Other values will remain untouched.
        */
        createViewModel(keys: string[], context?: any) : any {

            context = context || this;
            var model = {};

            _.each(keys, key => {

                var value = context[key];
                var mappedValue;

                if (ko.isObservable(value))
                    mappedValue = value;
                else if (value instanceof Model || value instanceof Collection)
                    mappedValue = value.observable();
                else if (_.isFunction(value))
                    mappedValue = _.bind(value, context);
                else
                    mappedValue = value;

                model[key] = mappedValue;
            });

            return model;
        }

        /** Returns the view element to delegate events to (defaults to this.$el). */
        getEventDelegationElement(): JQuery {
            return this.$el;
        }

        /** Clears all callbacks previously bound with delegateEvents. */
        undelegateEvents(parsed?): void {

            var suffix = '.delegateEvents' + this.cid;

            var $el = this.getEventDelegationElement();

            $el.off(suffix);

            if (parsed) {

                if (parsed.direct)
                    _.each(parsed.direct, (e: EventInfo) => this.$(e.selector).off(suffix));

                if (parsed.window)
                    $(window).off(suffix);

                if (parsed.document)
                    $(document).off(suffix);
            }
        }

        /** Delegates all events declared in 'this.events' to their targets */
        delegateEvents(events?): View {

            if (!this._allowDelegateEvents)
                return;

            events = events || _.result(this, 'events');

            var parsed = this._parseEvents(events);
            this.undelegateEvents(parsed);

            if (parsed.el)
                this._delegateEvents(parsed.el, this.getEventDelegationElement());

            if (parsed.direct)
                _.each(parsed.direct, eventInfo => this._delegateEvents([eventInfo], this.$(eventInfo.selector), false));

            if (parsed.window)
                this._delegateEvents(parsed.window, $(window), false);

            if (parsed.document)
                this._delegateEvents(parsed.document, $(document), false);

            return this;
        }

        /**
        * Internal method - does the actual delegation based on data from parseEvents. Also
        * applies filters and adapters to the handler.
        */
        private _delegateEvents(events: EventInfo[], target: JQuery, useSelector?: boolean) {

            // creates a closure to the event handler that always returns false if the handler doesn't return anything
            var makeClosure = method => () => {
                var result = method.apply(this, arguments);
                return result === undefined ? false : result;
            }

            var suffix = '.delegateEvents' + this.cid;

            for (var i = 0; i < events.length; i++) {

                var event = events[i];
                var method = event.method ? makeClosure(event.method) : null;

                if (method) {

                    if (event.adapter) {
                        var adapter = View.adapters[event.adapter];

                        if (adapter)
                            method = adapter(method, event.methodName);
                        else
                            throw new Error("Invalid adapter: " + event.adapter);
                    } 

                    if (event.filters)
                        method = this._applyFilters(event.filters, method, event.methodName);

                    if (useSelector === false)
                        target.on(event.eventName + suffix, method);
                    else
                        target.on(event.eventName + suffix, event.selector, method);
                }
            }
        }

        /** Internal method - Applies any filters declared in the event action */
        private _applyFilters(filterNames: string[], method, methodName) {

            var filters = [];

            for (var i = filterNames.length - 1; i >= 0; i--) {

                var filter = View.filters[filterNames[i]];

                if (!filter)
                    throw new Error("Invalid filter: " + filterNames[i]);

                filters.push(filter);
            }

            return () => {
                for (var i = 0; i < filters.length; i++) {
                    if (filters[i].apply(this, arguments)) {
                        return method.apply(this, arguments);
                    }
                }
            };
        }

        /**
        * Internal method - Parses the events object extracting all the information like
        * scope, selector, method names and adapters.
        */
        private _parseEvents(events): ParsedEventInfo {

            var parsedEvents = {};

            for (var key in events) {

                var delegateMatch = key.match(delegateEventSplitter);

                var scope = delegateMatch[1] || 'el',
                    eventName = delegateMatch[2],
                    selector = delegateMatch[3];

                var eventHandler = events[key];
                var filters = null, adapter = null, methodName = null, method = null;

                if (_.isFunction(eventHandler)) {
                    method = eventHandler;
                }
                else if (_.isString(eventHandler)) {

                    var methodMatch = eventHandler.match(actionMethodSplitter);

                    filters = this._parseFilters(methodMatch[1]);
                    adapter = methodMatch[2];
                    methodName = methodMatch[3];
                    method = this[methodName];

                    if (!method)
                        throw new Error("Event handler '" + methodName + " not found.");
                }

                var eventInfo = {
                    eventName: eventName,
                    methodName: methodName,
                    method: method,
                    selector: selector,
                    filters: filters,
                    adapter: adapter
                };

                (parsedEvents[scope] || (parsedEvents[scope] = [])).push(eventInfo);
            }

            return parsedEvents;
        }

        /** Internal method - Parses the filters from the action string if any */
        private _parseFilters(filter: string): string[] {

            if (filter && filter.length) {
                var filters = [], match;

                while (match = actionFilterSplitter.exec(filter))
                    filters.push(match[1]);

                return filters;
            }

            return null;
        }

        /** Closes the view, unbind events and clear unattached DOM nodes, leaving it ready for disposal. */
        close() {
            this.triggerMethod(['beforeClose', 'onBeforeClose']);

            this.undelegateEvents();
            ko.cleanNode(this.el);

            if (this._ownsElement)
                this.remove();
            else
                this.stopListening();

            if (this._usedTemplate)
                this.$el.empty();

            this.isRendered = false;

            this.triggerMethod(['close', 'onClose']);
        }

        /**
            Tries to get a template from an url. The url may be optionally followed by a selector ID.
            e.g. '/templates/file.html' or '/templates/file.html#selector-id'
        */
        private _getTemplateFromUrl(url: string): any {

            // finds the selector in the url
            var selector: string;
            var pos = url.indexOf('#');

            if (pos > 0) {
                selector = url.substring(pos);
                url = url.substring(0, pos);
            }

            // helper fn to return the template from the container
            var getHtmlTemplate = (container: JQuery, selector: string) => {
                if (selector)
                    return container.find(selector).first().html();
                else
                    return container.html();
            }

            // tries to get the template from the cache
            var cache = TemplateCache;
            var key = url.toLowerCase();
            var cacheItem = cache[key];

            // if the cacheItem is a jQuery element, it was already loaded so we return the template
            if (cacheItem instanceof jQuery) {
                return getHtmlTemplate(cacheItem, selector);
            }
            // if it is a promise, it means 'someone else' already requested it, so it returns a promise to the template
            else if (Utils.isPromise(cacheItem)) {
                var def = $.Deferred();

                cacheItem
                    .done((container: JQuery) => {
                        def.resolve(getHtmlTemplate(container, selector));
                    })
                    .fail(() => def.reject.apply(def, arguments));

                return def.promise();

            }
            // if its neither, make a request and create a promise to the template container
            else {
                // creates a promise for the cache
                var cacheDef = $.Deferred();

                // creates a promise to return
                var returnDef = $.Deferred();

                cacheItem = cache[key] = cacheDef.promise();

                $.get(url)
                    .done((content: string) => {

                        // parses the template content
                        var nodes = $.parseHTML(content.trim());
                        var container = $("<div>").append(nodes);

                        // replaces the promise in the cache with the container
                        cache[key] = container;

                        // resolves the return promise
                        returnDef.resolve(() => getHtmlTemplate(container, selector));

                        // resolves the promise with the container
                        cacheDef.resolve(container);
                    })
                    .fail(() => {
                        returnDef.reject.apply(returnDef, arguments);
                        cacheDef.reject.apply(cacheDef, arguments);
                    });

                return returnDef.promise();
            }
        }

        /**
            Adapters convert the event information into more useful values and pass them directly to the handlers.
            The adapter is a function that receives the actual handler retuns a wrapper function that calls it in some other way.
            By default, adapters should pass the event object as the last argument to the handler, so it can still be used if needed.
            To add more adapters, just use the static member: 
            Example:
            Knockbone.View.adapters['coordinates'] = method => e => method(e.pageX, e.pageY, e);
        */
        static adapters = {
            // passes the value ($(target).val()) of the target
            "value": method => e => method($(e.target).val(), e),

            // returns the data context for the target element
            "ko": method => e => method(e && ko.dataFor(e.target), e),

            // returns the model inside the context for the element
            "koModel": method => e => method(e && ko.dataFor(e.target).model(), e)
        }

        /**
            Filters are functions that receive the jquery event object and return a boolean value that indicates if
            the event handler should run or not. They are useful to do common decisions like "only run after 'enter' key is pressed".
            To add more filters, just use the static member Knockbone.View.filters['key'] = value.
        */
        static filters = {
            "keyEnter": e => e.which === 13,
            "keyEsc": e => e.which === 27,
            "keyTab": e => e.which === 9
        }
    }

    View.prototype.triggerMethod = triggerMethod;
}
