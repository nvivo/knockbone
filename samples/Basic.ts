module KnockboneSamples.Basic {

    export class BasicView extends Knockbone.View {

        events = {
            // this is a regular event handler
            "click button": "handleButtonClick",

            // this handler knockbone's filters and adapters
            // if the filter "keyEnter" passes, it uses the "value" adapter to call the handler
            "keyup input:text": "keyEnter ? value => handleEnter"
        }

        inputValue = ko.observable();
        outputValue = ko.observable();

        handleButtonClick() {
            var text = this.inputValue() + " - captured by button click";
            this.outputValue(text);
        }

        handleEnter() {
            var text = this.inputValue() + " - captured by enter key";
            this.outputValue(text);
        }
    }
}

// bootstraper
$(() => new KnockboneSamples.Basic.BasicView({ el: "#main" }).render());