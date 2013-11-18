module Knockbone {
    /**
        Service is a base class for RPC-style APIs. It provides helper methods for common actions on top of a base url.
        Once set the rootUrl, the call from any method can be made by relative urls. For example:

        class MyService extends Service {
           urlRoot = '/some/api';

           startProcessing(id) {
                // makes a POST to /some/api/start
                return this.post('start', { id: id }); 
           }

           addFile(file) {
                var data = new FormData();
                data.append('file', file);

                // makes a POST to /some/api/upload
                return this.upload('upload', data);
           }
        }
    */
    export class Service {

        urlRoot: any;
        ajaxSettings: JQueryAjaxSettings;

        /** Executes a 'GET' passing the data object in the query string.  */
        get(url: string, data?, options?: JQueryAjaxSettings) {
            return this.ajax('get', url, data, options);
        }

        /** Performs a 'POST' passing the data as JSON encoded form data */
        post(url: string, data, options?: JQueryAjaxSettings) {

            if ((options && options.processData) !== false)
                data = JSON.stringify(data);

            return this.ajax('post', url, data, options);
        }

        /** Performs a 'PUT' passing the data as JSON encoded form data */
        put(url: string, data, options?: JQueryAjaxSettings) {
            if ((options && options.processData) !== false)
                data = JSON.stringify(data);

            return this.ajax('put', url, data, options);
        }

        /** Performs a 'DELETE' passing the data as JSON encoded form data */
        delete(url: string, data?, options?: JQueryAjaxSettings) {
            if ((options && options.processData) !== false)
                data = JSON.stringify(data);

            return this.ajax('delete', url, data, options);
        }

        /** Provides a standard method for uploading data through XHR POST with support for "progress" event. */
        upload(url: string, data: FormData, options?: JQueryAjaxSettings): JQueryPromise<any> {

            var def = $.Deferred();

            options = _.extend({}, options, {
                processData: false,
                contentType: false,
                dataType: false,
                xhr: () => {
                    var xhr: XMLHttpRequest = $.ajaxSettings.xhr();
                    xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
                        def.notify(Math.floor(e.loaded / e.total * 100), e.loaded, e.total);
                    });

                    return xhr;
                }
            });

            var jqXhr = this.ajax('post', url, data, options)
                .done(() => def.resolve.apply(def, arguments))
                .fail(() => def.reject.apply(def, arguments));
            
            return def;
        }

        /** Rewrites the url if needed, apply default settings and handle the ajax request to jQuery.*/
        ajax(method: string, url: string, data: any, options: JQueryAjaxSettings) {

            // only add urlRoot as prefix if the url is relative
            if (url.charAt(0) !== '/') {

                var urlRoot: string = _.result(this, 'urlRoot');

                if (_.isString(urlRoot))
                    url = urlRoot + (urlRoot.charAt(urlRoot.length - 1) === '/' ? '' : '/') + url;
            }
            
            var settings = _.extend({}, this.ajaxSettings, { method: method, data: data }, options);

            return $.ajax(url, settings);
        }
    }

    Service.prototype.ajaxSettings = {
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    };
}
