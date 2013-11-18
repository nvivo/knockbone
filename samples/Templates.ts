module KnockboneSamples.Templates {

    export class ElementView extends Knockbone.View {
        source = ko.observable("an element in DOM");
    }

    export class ScriptTagView extends Knockbone.View {
        template = "#sample-template"
        source = ko.observable("a tag <script type='text/template'>");
    }

    export class ExternalHtmlView extends Knockbone.View {
        template = () => $.get("Templates_External.html");
        source = ko.observable("an external HTML file");
    }
}

// bootstraper
$(() => {
    var t = KnockboneSamples.Templates;

    new t.ElementView({ el: "#element-container" }).render();
    new t.ScriptTagView({ el: "#script-container" }).render();
    new t.ExternalHtmlView({ el: "#external-container" }).render();
});