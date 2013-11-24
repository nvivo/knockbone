module Knockbone {

    export interface ObservableCollection extends KnockoutComputed<any[]> {
        collection(): Collection;
        sort(sortFn: (model: Model) => any): void;
        sort(sortFn: (model: Model) => any, ascending: boolean): void;
        filter(filterFn: (model: Model) => boolean): void;
    }

    export class KoMapping {

        /** Creates a shallow computed observable of a model */
        public static observableModel(model: Model) {

            var observable: any = {};
            var events: Backbone.Events = _.extend({}, Backbone.Events);

            _.each(model.attributes, (attr: any, name: string) => {

                var tracker = ko.observable();

                var computed = observable[name] = ko.computed({
                    read: () => {
                        tracker();
                        return model.get(name);
                    },
                    write: (value) => {
                        model.set(name, value);
                    }
                });

                events.listenTo(model, "change:" + name, () => tracker.valueHasMutated());

            });

            observable.model = () => model;

            return observable;
        }

        /** Creates a read-only observable of a collection. */
        public static observableCollection(collection: Collection) : ObservableCollection {

            var _filter = ko.observable<any>();
            var _sort = ko.observable<any>();
            var _sortAsc = ko.observable<any>();

            var observable = <ObservableCollection> ko.computed(() => {

                // tracks any change in the collection
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

                // returns an array of model observables
                return _.map(models, (m: any) => m.observable());
            });

            // adds the additional methods to the computed observable
            observable.collection = () => collection;

            observable.sort = (sortFn, ascending = true) => {
                _sort(sortFn);
                _sortAsc(ascending);
            };

            observable.filter = (filterFn) => {
                _filter(filterFn);
            };

            return observable;
        }
    }
}