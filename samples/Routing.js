var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KnockboneSamples;
(function (KnockboneSamples) {
    (function (Routing) {
        var RoutingApp = (function (_super) {
            __extends(RoutingApp, _super);
            function RoutingApp() {
                _super.apply(this, arguments);
                this.routes = {
                    "": "list",
                    "new": "editNew",
                    "edit/:pos": "edit"
                };
            }
            RoutingApp.prototype.list = function () {
            };

            RoutingApp.prototype.editNew = function () {
            };

            RoutingApp.prototype.edit = function (position) {
            };
            return RoutingApp;
        })(Knockbone.Application);
        Routing.RoutingApp = RoutingApp;

        var ListView = (function (_super) {
            __extends(ListView, _super);
            function ListView() {
                _super.apply(this, arguments);
                this.template = "#template-list";
                this.items = ko.observableArray();
            }
            // if you want to have all the data before rendering the template, just return a promise on 'onBeforeRender'
            ListView.prototype.onBeforeRender = function () {
                return this.loadData();
            };

            // emulates loading from the server, returns a promise for when the data is loaded
            ListView.prototype.loadData = function () {
                var def = $.Deferred();

                setTimeout(function () {
                    def.resolve();
                    //           this.items(Storage.slice(0));
                }, 250);

                return def.promise();
            };
            return ListView;
        })(Knockbone.View);

        var Item = (function (_super) {
            __extends(Item, _super);
            function Item() {
                _super.apply(this, arguments);
            }
            Item.prototype.defaults = function () {
                return {
                    id: null,
                    name: null
                };
            };
            return Item;
        })(Knockbone.Model);

        var ItemCollection = (function (_super) {
            __extends(ItemCollection, _super);
            function ItemCollection() {
                _super.apply(this, arguments);
                this.model = Item;
            }
            return ItemCollection;
        })(Knockbone.Collection);
    })(KnockboneSamples.Routing || (KnockboneSamples.Routing = {}));
    var Routing = KnockboneSamples.Routing;
})(KnockboneSamples || (KnockboneSamples = {}));
