module Knockbone {

    export class Model extends Backbone.Model {

        private _observable;

        // Creates a shallow observable for the model or for a model attribute.
        observable(): any {
            if (!this._observable)
                this._observable = KoMapping.observableModel(this);

            return this._observable;
        }

        destroy(options?: Backbone.ModelDestroyOptions): JQueryPromise<any> {

            var result = super.destroy(options);

            // normalizes the return, so it always returns a promise
            if (result === false)
                return $.Deferred().resolve({ wasNew: true }).promise();
            else
                return result;
        }

        save(attributes?: any, options?: Backbone.ModelSaveOptions): JQueryPromise<any> {

            var result = super.save(attributes, options);

            // normalizes the return, so it always returns a promise
            if (result === false)
                return $.Deferred().reject({ validationFailed: true }).promise();
            else
                return result;
        }
    }
}
