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
                var _this = this;
                this.routes = {
                    "": function () {
                        return _this.filter(null);
                    },
                    "active": function () {
                        return _this.filter(false);
                    },
                    "completed": function () {
                        return _this.filter(true);
                    }
                };
                // All events are defined in the "events" property and are delegated to the view element,
                // there are no knockout "click" or "event" handlers in 'data-bind' attributes (although
                // you can define them there, it is not recommended).
                //
                // Knockbone extends backbone syntax in the form of "[filter ?] [adapter =>] methodName",
                // where filters decide if the handler should be called or not, while adapters convert the
                // event object to something else that is more apropriate to handle.
                //
                // For example:
                // - 'keyEnter ? value => addTodo' - passes the $(e.target).val() to "addTodo" only if the event started by an Enter key
                // - 'koModel => updateTodo' - extracts the knockbone Model from the target's knockout context data and passes to the updateTodo handler
                this.events = {
                    "keyup #new-todo": "keyEnter ? value => addTodo",
                    "click .destroy": "koModel => removeTodo",
                    "dblclick li label": "koModel => editTodo",
                    "keyup li input": "keyEnter ? value => updateTodo",
                    "blur li input": "value => updateTodo",
                    "click #toggle-all": "toggleAll",
                    "click #clear-completed": "clearCompleted"
                };
                // any model or collection is converted to an observable automatically during the viewModel generation
                this.todos = new TodoCollection();
                // observables are used only for html rendering
                this.newTitle = ko.observable();
                this.current = ko.observable();
                this.filterKey = ko.observable();
                this.todoCount = ko.computed(function () {
                    _this.todos.tracker();
                    return _this.todos.length;
                });
                this.todosCompleted = ko.computed(function () {
                    _this.todos.tracker();
                    return _this.todos.filter(function (m) {
                        return m.completed;
                    }).length;
                });
                this.todosLeft = ko.computed(function () {
                    return _this.todoCount() - _this.todosCompleted();
                });
            }
            // onBeforeRender is called automatically before rendering the view
            TodoApp.prototype.onBeforeRender = function () {
                this.todos.fetch();
            };

            // starting here, all methods are event handlers defined in the "events" property
            TodoApp.prototype.addTodo = function (title) {
                title = title.trim();

                if (title.length > 0)
                    this.todos.create({ title: title });

                this.newTitle(null);
            };

            TodoApp.prototype.editTodo = function (todo, e) {
                this.current(todo);
                $(e.target).parents("li").find("input").focus();
            };

            TodoApp.prototype.updateTodo = function (title) {
                var todo = this.current();

                if (todo) {
                    if (title) {
                        todo.title = title;
                        todo.save();
                    } else
                        todo.destroy();

                    this.current(null);
                }
            };

            TodoApp.prototype.removeTodo = function (todo) {
                todo.destroy();
            };

            TodoApp.prototype.toggleAll = function () {
                this.todos.each(function (m) {
                    return m.completed = !m.completed;
                });
            };

            TodoApp.prototype.clearCompleted = function () {
                var completed = this.todos.filter(function (m) {
                    return m.completed;
                });
                _.each(completed, function (m) {
                    return m.destroy();
                });
            };

            TodoApp.prototype.filter = function (completed) {
                if (_.isBoolean(completed)) {
                    this.todos.observable().filter(function (m) {
                        return m.completed == completed;
                    });
                    this.filterKey(completed ? 'completed' : 'active');
                } else {
                    this.todos.observable().filter(null);
                    this.filterKey('all');
                }
            };
            return TodoApp;
        })(Knockbone.Application);
        TodoMvc.TodoApp = TodoApp;

        var Todo = (function (_super) {
            __extends(Todo, _super);
            function Todo(attributes, options) {
                var _this = this;
                _super.call(this, attributes, options);
                this.localStorage = new Backbone.LocalStorage("TodoCollection");

                // saves the model on toggle
                this.on('change:completed', function () {
                    return _this.save();
                });
            }
            Todo.prototype.defaults = function () {
                return {
                    title: '',
                    completed: false
                };
            };

            Object.defineProperty(Todo.prototype, "title", {
                // getters and setters are optional, but they make it easier to work with models
                get: function () {
                    return this.get('title');
                },
                set: function (value) {
                    this.set('title', value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Todo.prototype, "completed", {
                get: function () {
                    return this.get('completed');
                },
                set: function (value) {
                    this.set('completed', value);
                },
                enumerable: true,
                configurable: true
            });

            return Todo;
        })(Knockbone.Model);
        TodoMvc.Todo = Todo;

        var TodoCollection = (function (_super) {
            __extends(TodoCollection, _super);
            function TodoCollection() {
                _super.apply(this, arguments);
                this.model = Todo;
                this.localStorage = new Backbone.LocalStorage("TodoCollection");
            }
            return TodoCollection;
        })(Knockbone.Collection);
        TodoMvc.TodoCollection = TodoCollection;
    })(KnockboneSamples.TodoMvc || (KnockboneSamples.TodoMvc = {}));
    var TodoMvc = KnockboneSamples.TodoMvc;
})(KnockboneSamples || (KnockboneSamples = {}));
