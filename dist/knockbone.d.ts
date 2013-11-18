declare module Knockbone {
    var Version: string;
}
declare module Knockbone {
    function triggerMethod(arr: string[], ...args): any;
    function triggerMethod(eventName: string, ...args): any;
}
declare module Knockbone {
    class Utils {
        static isPromise(arg): boolean;
        static when(arg, callback);
    }
}
declare module Knockbone {
    interface ObservableCollection extends KnockoutComputed<any[]> {
        collection(): Knockbone.Collection;
        sort(sortFn: (model: Knockbone.Model) => any): void;
        sort(sortFn: (model: Knockbone.Model) => any, ascending: boolean): void;
        filter(filterFn: (model: Knockbone.Model) => boolean): void;
    }
    class KoMapping {
        static observableModel(model: Knockbone.Model);
        static observableCollection(collection: Knockbone.Collection): ObservableCollection;
    }
}
declare module Knockbone {
    class View extends Backbone.View {
        constructor(options?);
        public events: any;
        public views: any;
        public template: any;
        public triggerMethod: {
            (arr: string[], ...args: any[]): any;
            (eventName: string, ...args: any[]): any;
        };
        public isRendered: boolean;
        private _allowDelegateEvents;
        public render(): View;
        public renderAsync(): JQueryPromise<any>;
        private _createChildViews();
        private _renderChildViews();
        private _triggerDomInsert();
        public getTemplate(template?: any): any;
        public getViewModel(): any;
        public createViewModel(keys: string[], context?: any): any;
        public undelegateEvents(parsed?): void;
        public delegateEvents(events?): View;
        private _delegateEvents(events, target, useSelector?);
        private _applyFilters(filterNames, method, methodName);
        private _parseEvents(events);
        private _parseFilters(filter);
        static adapters: {
            "value": (method: any) => (e: any) => any;
            "ko": (method: any) => (e: any) => any;
            "koModel": (method: any) => (e: any) => any;
        };
        static filters: {
            "keyEnter": (e: any) => boolean;
            "keyEsc": (e: any) => boolean;
            "keyTab": (e: any) => boolean;
        };
    }
}
declare module Knockbone {
    class Application extends Knockbone.View {
        public routes: any;
        public router: Backbone.Router;
        public start(): void;
        private _createRouter();
        public renderView(view: Knockbone.View, container?: any): void;
        public renderTemplate(template: any, container?: any): void;
        private _resolveContainer(container?);
    }
}
declare module Knockbone {
    class Collection extends Backbone.Collection {
        private _tracker;
        private _observable;
        public urlRoot: any;
        public tracker : KnockoutObservable<any>;
        public observable(): Knockbone.ObservableCollection;
    }
}
declare module Knockbone {
    class Model extends Backbone.Model {
        private _observable;
        public observable(): any;
    }
}
declare module Knockbone {
    class Service {
        public urlRoot: any;
        public ajaxSettings: JQueryAjaxSettings;
        public get(url: string, data?, options?: JQueryAjaxSettings): JQueryXHR;
        public post(url: string, data, options?: JQueryAjaxSettings): JQueryXHR;
        public put(url: string, data, options?: JQueryAjaxSettings): JQueryXHR;
        public delete(url: string, data?, options?: JQueryAjaxSettings): JQueryXHR;
        public upload(url: string, data: FormData, options?: JQueryAjaxSettings): JQueryPromise<any>;
        public ajax(method: string, url: string, data: any, options: JQueryAjaxSettings): JQueryXHR;
    }
}
