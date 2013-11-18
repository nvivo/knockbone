knockbone
=========

Knockbone is an opinionated SPA framework based on Backbone.js and Knockout.js built with TypeScript. It has a different approach from [Knockback](http://kmalakoff.github.io/knockback/), where it focuses on using the most out of backbone while keeping Knockout exclusively for HTML rendering.

Main Features
-------------

* Uses Backbone views as controllers and event handling
* Converts views into knockout viewModels automatically, while allowing you to control the process if you need to
* Supports promises for loading data and external templates
* Extended DOM event handling with filters and adapters

_Attention: while this is a javascript library and can be used with pure javascript code, it was built to take advantage of TypeScript syntax to make the code easier to write and understand. It will run fine, but there will be no methods like ".extend" in classes._

Basics
------

This explanation assumes you already know how [Backbone.js](http://backbonejs.org/) works.

These are the base classes of Knockbone. These classes extends Backbone's classes and have the same purpose, except they have more opinionated implementations.

* View - main view/controller, used most of the time
* Application - an extended view with integrated router, used as a bootstraper
* Model - Backbone.Model with observable support
* Collection - Backbone.Collection with observable support
* Service - A base class to be used with non-REST apis (ie. rpc-style apis)

Backbone Views are actually more like controllers, they usually have models and collections as properties, and methods as event handlers. Knockout's viewModels are the same, but have no defined structre. You can use any object as a knockout view model.

Knockbone unifies these concepts by automatically converting backbone views into knockout viewmodels during rendering. The result is that you have a much better organized code with backbone, while having a much better templating system with knockout and no need to bind events.

How to install
--------------

Knockbone builds on top of Backbone and Knockout, but they have their own dependencies.
In order to add Knockbone to your project, you need:

* jQuery
* Underscore or lodash
* Backbone
* KnockoutJs

Also, since it is built with Typescript, you will need the [typings](https://github.com/borisyankov/DefinitelyTyped) for these libraries as well. After that, copy knockbone.js and knockbone.d.ts from the [dist folder](https://github.com/nvivo/knockbone/tree/master/dist/) to your project and you should be ready to go.

Notes
-----

This is a work in progress, but it works fine. If you liked and have ideas or found issues, please let me know.

Checkout the [Samples directory](https://github.com/nvivo/knockbone/tree/master/samples/) for an implemented TodoMvc application.

License
-------

Copyright (c) 2013 Natan Vivo

Licensed under the [Apache License, Version 2.0]
(http://www.apache.org/licenses/LICENSE-2.0)
