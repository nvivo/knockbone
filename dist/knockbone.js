var Knockbone;
(function (Knockbone) {
    Knockbone.Version = '0.3.2';
})(Knockbone || (Knockbone = {}));
var Knockbone;
(function (Knockbone) {
    var splitter = /(^|:)(\w)/gi;

    function getEventName(match, prefix, eventName) {
        return eventName.toUpperCase();
    }

    

    function triggerMethod(event) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        var eventName, methodName;

        if (_.isArray(event)) {
            eventName = event[0];
            methodName = event[1];
        } else {
            eventName = event;
            methodName = 'on' + eventName.replace(splitter, getEventName);
        }

        this.trigger(eventName, args);

        var method = this[methodName];

        if (_.isFunction(method))
            return method.apply(this, args);
    }
    Knockbone.triggerMethod = triggerMethod;
})(Knockbone || (Knockbone = {}));
var Knockbone;
(function (Knockbone) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.isPromise = function (arg) {
            return arg && _.isFunction(arg.then);
        };

        Utils.when = function (arg, callback) {
            if (Utils.isPromise(arg))
                return arg.then(callback);
            else
                return callback(arg);
        };

        Utils.isUrl = function (arg) {
            return (arg && _.isString(arg) && (arg.charAt(0) === '/' || arg.indexOf('http') === 0));
        };
        return Utils;
    })();
    Knockbone.Utils = Utils;
})(Knockbone || (Knockbone = {}));
var Knockbone;
(function (Knockbone) {
    var KoMapping = (function () {
        function KoMapping() {
        }
        KoMapping.observableModel = function (model) {
            var observable = {};
            var events = _.extend({}, Backbone.Events);

            _.each(model.attributes, function (attr, name) {
                var tracker = ko.observable();

                var computed = observable[name] = ko.computed({
                    read: function () {
                        tracker();
                        return model.get(name);
                    },
                    write: function (value) {
                        model.set(name, value);
                    }
                });

                events.listenTo(model, "change:" + name, function () {
                    return tracker.valueHasMutated();
                });
            });

            observable.model = function () {
                return model;
            };

            return observable;
        };

        KoMapping.observableCollection = function (collection) {
            var _filter = ko.observable();
            var _sort = ko.observable();
            var _sortAsc = ko.observable();

            var observable = ko.computed(function () {
                collection.tracker();

                var filter = _filter();
                var sort = _sort();
                var sortAsc = _sortAsc();

                var models;

                if (filter)
                    models = collection.filter(filter);
                else
                    models = collection.models.slice(0);

                if (sort) {
                    models = _.sortBy(models, sort);

                    if (!sortAsc)
                        models = models.reverse();
                }

                return _.map(models, function (m) {
                    return m.observable();
                });
            });

            observable.collection = function () {
                return collection;
            };

            observable.sort = function (sortFn, ascending) {
                if (typeof ascending === "undefined") { ascending = true; }
                _sort(sortFn);
                _sortAsc(ascending);
            };

            observable.filter = function (filterFn) {
                _filter(filterFn);
            };

            return observable;
        };
        return KoMapping;
    })();
    Knockbone.KoMapping = KoMapping;
})(Knockbone || (Knockbone = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Knockbone;
(function (Knockbone) {
    var delegateEventSplitter = /^(?:\((.*)\)\s*)?(\S+)\s*(.*)$/;

    var actionMethodSplitter = /^(?:(.+)\?\s*)?(?:(\S+)\s*=>\s*)?(.*)$/;

    var actionFilterSplitter = /(\w+)(?:\s*\|\s*)?/g;

    Knockbone.TemplateCache = {};

    var View = (function (_super) {
        __extends(View, _super);
        function View(options) {
            _super.call(this, options);
            this.isRendered = false;
            this._allowDelegateEvents = false;

            if (options && options.el)
                this._ownsElement = true;

            this._allowDelegateEvents = true;
        }
        View.prototype.render = function () {
            this.renderAsync();
            return this;
        };

        View.prototype.renderAsync = function () {
            var _this = this;
            if (this.isRendered)
                return $.when();

            var def = $.Deferred();

            var beforeRender = this.triggerMethod(['beforeRender', 'onBeforeRender']);

            this._createChildViews();

            Knockbone.Utils.when(beforeRender, function () {
                var template = _this.getTemplate();
                var viewModel = _this.getViewModel();

                Knockbone.Utils.when(template, function (template) {
                    _this.triggerMethod(['beforeRenderTemplate', 'onBeforeRenderTemplate']);

                    if (template) {
                        _this.$el.html(template);
                        _this._usedTemplate = true;
                    }

                    _this.triggerMethod(['renderTemplate', 'onRenderTemplate']);

                    Knockbone.Utils.when(viewModel, function (viewModel) {
                        _this.triggerMethod(['beforeApplyBindings', 'onBeforeApplyBindings']);

                        if (viewModel)
                            ko.applyBindings(viewModel, _this.el);

                        _this.triggerMethod(['applyBindings', 'onApplyBindings']);

                        _this.triggerMethod(['beforeRenderChildren', 'onBeforeRenderChildren']);

                        var childrenRendered = _this._renderChildViews();

                        Knockbone.Utils.when(childrenRendered, function () {
                            _this.triggerMethod(['renderChildren', 'onRenderChildren']);

                            _this.delegateEvents();

                            _this.triggerMethod(['render', 'onRender']);

                            _this._triggerDomInsert();

                            _this.isRendered = true;

                            def.resolve();
                        });
                    });
                });
            });

            return def.promise();
        };

        View.prototype._createChildViews = function () {
            var _this = this;
            if (this.views) {
                _.each(this.views, function (def, name) {
                    var view = new def.view();

                    def.instance = view;

                    if (_this[name] === undefined)
                        _this[name] = view;
                });
            }
        };

        View.prototype._renderChildViews = function () {
            var _this = this;
            if (this.views) {
                var promises = [];

                _.each(this.views, function (def) {
                    var view = def.instance;

                    if (def.instance instanceof View) {
                        promises.push(view.renderAsync());

                        var container = def.container;

                        if (container)
                            _this.$(container).html(view.el);
                    }
                });

                return $.when.apply(null, promises);
            }

            return null;
        };

        View.prototype._triggerDomInsert = function () {
            var _this = this;
            var methodName = 'onDOMInsert';

            if (this[methodName]) {
                var docElement = document.documentElement;
                var el = this.el;

                var checkDOM = function () {
                    if ($.contains(docElement, el))
                        _this.triggerMethod(['dominsert', methodName]);
                    else
                        setTimeout(checkDOM, 10);
                };

                checkDOM();
            }
        };

        View.prototype.getTemplate = function (template) {
            template = template || _.result(this, "template");

            if (template) {
                if (Knockbone.Utils.isUrl(template))
                    return this._getTemplateFromUrl(template);

                if (Knockbone.Utils.isPromise(template))
                    return template;

                return $(template).html();
            }

            return null;
        };

        View.prototype.getViewModel = function () {
            var keys = [];

            _.each(this, function (value, key) {
                if (key.charAt(0) !== '_' && (value instanceof Knockbone.Model || value instanceof Knockbone.Collection || ko.isObservable(value)))
                    keys.push(key);
            });

            return this.createViewModel(keys, this);
        };

        View.prototype.createViewModel = function (keys, context) {
            context = context || this;
            var model = {};

            _.each(keys, function (key) {
                var value = context[key];
                var mappedValue;

                if (ko.isObservable(value))
                    mappedValue = value;
                else if (value instanceof Knockbone.Model || value instanceof Knockbone.Collection)
                    mappedValue = value.observable();
                else if (_.isFunction(value))
                    mappedValue = _.bind(value, context);
                else
                    mappedValue = value;

                model[key] = mappedValue;
            });

            return model;
        };

        View.prototype.getEventDelegationElement = function () {
            return this.$el;
        };

        View.prototype.undelegateEvents = function (parsed) {
            var _this = this;
            var suffix = '.delegateEvents' + this.cid;

            var $el = this.getEventDelegationElement();

            $el.off(suffix);

            if (parsed) {
                if (parsed.direct)
                    _.each(parsed.direct, function (e) {
                        return _this.$(e.selector).off(suffix);
                    });

                if (parsed.window)
                    $(window).off(suffix);

                if (parsed.document)
                    $(document).off(suffix);
            }
        };

        View.prototype.delegateEvents = function (events) {
            var _this = this;
            if (!this._allowDelegateEvents)
                return;

            events = events || _.result(this, 'events');

            var parsed = this._parseEvents(events);
            this.undelegateEvents(parsed);

            if (parsed.el)
                this._delegateEvents(parsed.el, this.getEventDelegationElement());

            if (parsed.direct)
                _.each(parsed.direct, function (eventInfo) {
                    return _this._delegateEvents([eventInfo], _this.$(eventInfo.selector), false);
                });

            if (parsed.window)
                this._delegateEvents(parsed.window, $(window), false);

            if (parsed.document)
                this._delegateEvents(parsed.document, $(document), false);

            return this;
        };

        View.prototype._delegateEvents = function (events, target, useSelector) {
            var _this = this;
            var makeClosure = function (method) {
                return function () {
                    var result = method.apply(_this, arguments);
                    return result === undefined ? false : result;
                };
            };

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
        };

        View.prototype._applyFilters = function (filterNames, method, methodName) {
            var _this = this;
            var filters = [];

            for (var i = filterNames.length - 1; i >= 0; i--) {
                var filter = View.filters[filterNames[i]];

                if (!filter)
                    throw new Error("Invalid filter: " + filterNames[i]);

                filters.push(filter);
            }

            return function () {
                for (var i = 0; i < filters.length; i++) {
                    if (filters[i].apply(_this, arguments)) {
                        return method.apply(_this, arguments);
                    }
                }
            };
        };

        View.prototype._parseEvents = function (events) {
            var parsedEvents = {};

            for (var key in events) {
                var delegateMatch = key.match(delegateEventSplitter);

                var scope = delegateMatch[1] || 'el', eventName = delegateMatch[2], selector = delegateMatch[3];

                var eventHandler = events[key];
                var filters = null, adapter = null, methodName = null, method = null;

                if (_.isFunction(eventHandler)) {
                    method = eventHandler;
                } else if (_.isString(eventHandler)) {
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
        };

        View.prototype._parseFilters = function (filter) {
            if (filter && filter.length) {
                var filters = [], match;

                while (match = actionFilterSplitter.exec(filter))
                    filters.push(match[1]);

                return filters;
            }

            return null;
        };

        View.prototype.close = function () {
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
        };

        View.prototype._getTemplateFromUrl = function (url) {
            var selector;
            var pos = url.indexOf('#');

            if (pos > 0) {
                selector = url.substring(pos);
                url = url.substring(0, pos);
            }

            var getHtmlTemplate = function (container, selector) {
                if (selector)
                    return container.find(selector).first().html();
                else
                    return container.html();
            };

            var cache = Knockbone.TemplateCache;
            var key = url.toLowerCase();
            var cacheItem = cache[key];

            if (cacheItem instanceof jQuery) {
                return getHtmlTemplate(cacheItem, selector);
            } else if (Knockbone.Utils.isPromise(cacheItem)) {
                var def = $.Deferred();

                cacheItem.done(function (container) {
                    def.resolve(getHtmlTemplate(container, selector));
                }).fail(function () {
                    return def.reject.apply(def, arguments);
                });

                return def.promise();
            } else {
                var cacheDef = $.Deferred();

                var returnDef = $.Deferred();

                cacheItem = cache[key] = cacheDef.promise();

                $.get(url).done(function (content) {
                    var nodes = $.parseHTML(content.trim());
                    var container = $("<div>").append(nodes);

                    cache[key] = container;

                    returnDef.resolve(function () {
                        return getHtmlTemplate(container, selector);
                    });

                    cacheDef.resolve(container);
                }).fail(function () {
                    returnDef.reject.apply(returnDef, arguments);
                    cacheDef.reject.apply(cacheDef, arguments);
                });

                return returnDef.promise();
            }
        };

        View.adapters = {
            "value": function (method) {
                return function (e) {
                    return method($(e.target).val(), e);
                };
            },
            "ko": function (method) {
                return function (e) {
                    return method(e && ko.dataFor(e.target), e);
                };
            },
            "koModel": function (method) {
                return function (e) {
                    return method(e && ko.dataFor(e.target).model(), e);
                };
            }
        };

        View.filters = {
            "keyEnter": function (e) {
                return e.which === 13;
            },
            "keyEsc": function (e) {
                return e.which === 27;
            },
            "keyTab": function (e) {
                return e.which === 9;
            }
        };
        return View;
    })(Backbone.View);
    Knockbone.View = View;

    View.prototype.triggerMethod = Knockbone.triggerMethod;
})(Knockbone || (Knockbone = {}));
var Knockbone;
(function (Knockbone) {
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application() {
            _super.apply(this, arguments);
        }
        Application.prototype.start = function () {
            this._createRouter();

            Backbone.history.start();
        };

        Application.prototype._createRouter = function () {
            var _this = this;
            var routes = this.routes;

            if (routes) {
                var hasRoutes = false;
                var path, target;

                for (path in routes) {
                    if (routes.hasOwnProperty(path)) {
                        target = routes[path];

                        if (_.isString(target)) {
                            routes[path] = (function () {
                                var fn = _this[target];

                                if (_.isFunction(fn)) {
                                    return function () {
                                        return fn.apply(_this, arguments);
                                    };
                                }
                            })();
                        }
                    }
                }

                this.router = new Backbone.Router({
                    routes: routes
                });
            }
        };

        Application.prototype.renderView = function (view, container) {
            if (!(view instanceof Knockbone.View))
                throw new Error("View is not an instance of Knockbone.View.");

            container = this._resolveContainer(container);

            var def = $.Deferred();

            if (!view.isRendered) {
                view.renderAsync().done(function () {
                    def.resolve();
                });
            } else {
                def.resolve();
            }

            def.done(function () {
                return container.html(view.el);
            });

            return def.promise();
        };

        Application.prototype.renderTemplate = function (template, container) {
            container = this._resolveContainer(container);
            template = this.getTemplate(template);

            Knockbone.Utils.when(template, function () {
                return container.html(template);
            });
        };

        Application.prototype._resolveContainer = function (container) {
            if (container) {
                if (_.isString(container))
                    container = this.$(container);

                return container;
            }

            return this.$el;
        };
        return Application;
    })(Knockbone.View);
    Knockbone.Application = Application;
})(Knockbone || (Knockbone = {}));
var Knockbone;
(function (Knockbone) {
    var Collection = (function (_super) {
        __extends(Collection, _super);
        function Collection() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(Collection.prototype, "tracker", {
            get: function () {
                var _this = this;
                if (!this._tracker) {
                    this._tracker = ko.observable();
                    this.on('all', function (eventName) {
                        _this.tracker.notifySubscribers(null);
                    });
                }

                return this._tracker;
            },
            enumerable: true,
            configurable: true
        });

        Collection.prototype.observable = function () {
            if (!this._observable)
                this._observable = Knockbone.KoMapping.observableCollection(this);

            return this._observable;
        };
        return Collection;
    })(Backbone.Collection);
    Knockbone.Collection = Collection;

    Collection.prototype.url = function () {
        return _.result(this, "urlRoot");
    };
})(Knockbone || (Knockbone = {}));
var Knockbone;
(function (Knockbone) {
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model() {
            _super.apply(this, arguments);
        }
        Model.prototype.observable = function () {
            if (!this._observable)
                this._observable = Knockbone.KoMapping.observableModel(this);

            return this._observable;
        };

        Model.prototype.destroy = function (options) {
            var result = _super.prototype.destroy.call(this, options);

            if (result === false)
                return $.Deferred().resolve({ wasNew: true }).promise();
            else
                return result;
        };

        Model.prototype.save = function (attributes, options) {
            var result = _super.prototype.save.call(this, attributes, options);

            if (result === false)
                return $.Deferred().reject({ validationFailed: true }).promise();
            else
                return result;
        };
        return Model;
    })(Backbone.Model);
    Knockbone.Model = Model;
})(Knockbone || (Knockbone = {}));
var Knockbone;
(function (Knockbone) {
    var Service = (function () {
        function Service() {
        }
        Service.prototype.get = function (url, data, options) {
            return this.ajax('get', url, data, options);
        };

        Service.prototype.post = function (url, data, options) {
            if ((options && options.processData) !== false)
                data = JSON.stringify(data);

            return this.ajax('post', url, data, options);
        };

        Service.prototype.put = function (url, data, options) {
            if ((options && options.processData) !== false)
                data = JSON.stringify(data);

            return this.ajax('put', url, data, options);
        };

        Service.prototype.delete = function (url, data, options) {
            if ((options && options.processData) !== false)
                data = JSON.stringify(data);

            return this.ajax('delete', url, data, options);
        };

        Service.prototype.upload = function (url, data, options) {
            var def = $.Deferred();

            options = _.extend({}, options, {
                processData: false,
                contentType: false,
                dataType: false,
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();
                    xhr.upload.addEventListener('progress', function (e) {
                        def.notify(Math.floor(e.loaded / e.total * 100), e.loaded, e.total);
                    });

                    return xhr;
                }
            });

            var jqXhr = this.ajax('post', url, data, options).done(function () {
                return def.resolve.apply(def, arguments);
            }).fail(function () {
                return def.reject.apply(def, arguments);
            });

            return def;
        };

        Service.prototype.ajax = function (method, url, data, options) {
            if (url.charAt(0) !== '/') {
                var urlRoot = _.result(this, 'urlRoot');

                if (_.isString(urlRoot))
                    url = urlRoot + (urlRoot.charAt(urlRoot.length - 1) === '/' ? '' : '/') + url;
            }

            var settings = _.extend({}, this.ajaxSettings, { method: method, data: data }, options);

            return $.ajax(url, settings);
        };
        return Service;
    })();
    Knockbone.Service = Service;

    Service.prototype.ajaxSettings = {
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    };
})(Knockbone || (Knockbone = {}));
//# sourceMappingURL=knockbone.js.map
