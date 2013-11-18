var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KnockboneSamples;
(function (KnockboneSamples) {
    (function (Basic) {
        var BasicView = (function (_super) {
            __extends(BasicView, _super);
            function BasicView() {
                _super.apply(this, arguments);
                this.events = {
                    // this is a regular event handler
                    "click button": "handleButtonClick",
                    // this handler knockbone's filters and adapters
                    // if the filter "keyEnter" passes, it uses the "value" adapter to call the handler
                    "keyup input:text": "keyEnter ? value => handleEnter"
                };
                this.inputValue = ko.observable();
                this.outputValue = ko.observable();
            }
            BasicView.prototype.handleButtonClick = function () {
                var text = this.inputValue() + " - captured by button click";
                this.outputValue(text);
            };

            BasicView.prototype.handleEnter = function () {
                var text = this.inputValue() + " - captured by enter key";
                this.outputValue(text);
            };
            return BasicView;
        })(Knockbone.View);
        Basic.BasicView = BasicView;
    })(KnockboneSamples.Basic || (KnockboneSamples.Basic = {}));
    var Basic = KnockboneSamples.Basic;
})(KnockboneSamples || (KnockboneSamples = {}));

// bootstraper
$(function () {
    return new KnockboneSamples.Basic.BasicView({ el: "#main" }).render();
});
