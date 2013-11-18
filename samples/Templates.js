var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KnockboneSamples;
(function (KnockboneSamples) {
    (function (Templates) {
        var ElementView = (function (_super) {
            __extends(ElementView, _super);
            function ElementView() {
                _super.apply(this, arguments);
                this.source = ko.observable("an element in DOM");
            }
            return ElementView;
        })(Knockbone.View);
        Templates.ElementView = ElementView;

        var ScriptTagView = (function (_super) {
            __extends(ScriptTagView, _super);
            function ScriptTagView() {
                _super.apply(this, arguments);
                this.template = "#sample-template";
                this.source = ko.observable("a tag <script type='text/template'>");
            }
            return ScriptTagView;
        })(Knockbone.View);
        Templates.ScriptTagView = ScriptTagView;

        var ExternalHtmlView = (function (_super) {
            __extends(ExternalHtmlView, _super);
            function ExternalHtmlView() {
                _super.apply(this, arguments);
                this.template = function () {
                    return $.get("Templates_External.html");
                };
                this.source = ko.observable("an external HTML file");
            }
            return ExternalHtmlView;
        })(Knockbone.View);
        Templates.ExternalHtmlView = ExternalHtmlView;
    })(KnockboneSamples.Templates || (KnockboneSamples.Templates = {}));
    var Templates = KnockboneSamples.Templates;
})(KnockboneSamples || (KnockboneSamples = {}));

// bootstraper
$(function () {
    var t = KnockboneSamples.Templates;

    new t.ElementView({ el: "#element-container" }).render();
    new t.ScriptTagView({ el: "#script-container" }).render();
    new t.ExternalHtmlView({ el: "#external-container" }).render();
});
