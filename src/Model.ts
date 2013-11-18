module Knockbone {

    export class Model extends Backbone.Model {

        private _observable;

        // Creates a shallow observable for the model or for a model attribute.
        observable(): any {
            if (!this._observable)
                this._observable = KoMapping.observableModel(this);

            return this._observable;
        }
    }
}
