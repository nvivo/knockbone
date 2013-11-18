module Knockbone {

    export class Collection extends Backbone.Collection {

        private _tracker;
        private _observable;
        urlRoot: any;

        /**
        * A tracker observable that is notified if anything changes in the collection.
        * Can be used to track the collection inside computed observables.
        */
        get tracker() : KnockoutObservable<any> {
            if (!this._tracker) {
                this._tracker = ko.observable();
                this.on('all', eventName => { this.tracker.notifySubscribers(null); });
            }

            return this._tracker;
        }

        /**
        * Creates a shallow observable for the model.
        */
        observable(): ObservableCollection {
            if (!this._observable)
                this._observable = KoMapping.observableCollection(this);

            return this._observable;
        }
    }

    Collection.prototype.url = function () {
        return _.result(this, "urlRoot");
    }
}
