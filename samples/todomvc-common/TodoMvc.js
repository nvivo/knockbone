var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KnockboneSamples;
(function (KnockboneSamples) {
    (function (TodoMvc) {
        var TodoApp = (function (_super) {
            __extends(TodoApp, _super);
            function TodoApp() {
                _super.apply(this, arguments);
            }
            return TodoApp;
        })(Knockbone.Application);
        TodoMvc.TodoApp = TodoApp;
    })(KnockboneSamples.TodoMvc || (KnockboneSamples.TodoMvc = {}));
    var TodoMvc = KnockboneSamples.TodoMvc;
})(KnockboneSamples || (KnockboneSamples = {}));
