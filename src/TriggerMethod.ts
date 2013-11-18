module Knockbone {
    
    // This code is based on Marionette's [http://marionettejs.com/] triggerMethod.

    // split the event name on the :
    var splitter = /(^|:)(\w)/gi;

    // take the event section ("section1:section2:section3")
    // and turn it in to uppercase name
    function getEventName(match, prefix, eventName) {
        return eventName.toUpperCase();
    }
    
    // Triggers an event and a corresponding method name.
    //
    // `this.triggerMethod("foo")` will trigger the "Foo" event and
    // call the "onFoo" method. 
    //
    // `this.triggerMethod("FooBar") will trigger the "FooBar" event and
    // call the "onFooBar" method.
    //
    // `this.triggerMethod(["foo:bar", "onFooBar"]) will trigger the "foo:bar" event and
    // call the "onFooBar" method. This is used internally for performance reasons.
    export function triggerMethod(arr: string[], ...args): any
    export function triggerMethod(eventName: string, ...args): any
    export function triggerMethod(event: any, ...args): any {

        var eventName, methodName;

        if (_.isArray(event)) {
            eventName = event[0];
            methodName = event[1];
        }
        else {
            eventName = event;
            methodName = 'on' + eventName.replace(splitter, getEventName);
        }

        this.trigger(eventName, args);

        var method = this[methodName];

        if (_.isFunction(method))
            return method.apply(this, args);
    }
}
