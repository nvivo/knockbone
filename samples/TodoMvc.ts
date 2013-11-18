module KnockboneSamples.TodoMvc {

    export class TodoApp extends Knockbone.Application {

        routes = {
            "": () => this.filter(null),
            "active": () => this.filter(false),
            "completed": () => this.filter(true)
        }

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

        events = {
            "keyup #new-todo": "keyEnter ? value => addTodo",
            "click .destroy": "koModel => removeTodo",
            "dblclick li label": "koModel => editTodo",
            "keyup li input": "keyEnter ? value => updateTodo",
            "blur li input": "value => updateTodo",
            "click #toggle-all": "toggleAll",
            "click #clear-completed": "clearCompleted"
        }

        // any model or collection is converted to an observable automatically during the viewModel generation
        todos = new TodoCollection();

        // observables are used only for html rendering
        newTitle = ko.observable<string>();
        current = ko.observable<Todo>();
        filterKey = ko.observable();

        todoCount = ko.computed(() => {
            this.todos.tracker();
            return this.todos.length;
        });

        todosCompleted = ko.computed(() => {
            this.todos.tracker();
            return this.todos.filter((m: Todo) => m.completed).length;
        });

        todosLeft = ko.computed(() => this.todoCount() - this.todosCompleted());

        // onBeforeRender is called automatically before rendering the view
        onBeforeRender() {
            this.todos.fetch();
        }

        // starting here, all methods are event handlers defined in the "events" property

        addTodo(title: string) {

            title = title.trim();

            if (title.length > 0)
                this.todos.create({ title: title });
            
            this.newTitle(null);
        }

        editTodo(todo: Todo, e: JQueryEventObject) {
            this.current(todo);
            $(e.target).parents("li").find("input").focus();
        }

        updateTodo(title: string) {
            var todo = this.current();

            if (todo) {
                if (title) {
                    todo.title = title;
                    todo.save();
                }
                else
                    todo.destroy();

                this.current(null);
            }
        }

        removeTodo(todo: Todo) {
            todo.destroy();
        }

        toggleAll() {
            this.todos.each((m: Todo) => m.completed = !m.completed);
        }

        clearCompleted() {
            var completed = this.todos.filter((m: Todo) => m.completed);
            _.each(completed, m => m.destroy());
        }

        filter(completed?: boolean) {

            if (_.isBoolean(completed)) {
                this.todos.observable().filter((m: Todo)  => m.completed == completed);
                this.filterKey(completed ? 'completed' : 'active');
            }
            else {
                this.todos.observable().filter(null);
                this.filterKey('all');
            }
        }
    }

    export class Todo extends Knockbone.Model {

        constructor(attributes, options) {
            super(attributes, options);
            // saves the model on toggle
            this.on('change:completed', () => this.save());
        }

        localStorage = new (<any> Backbone).LocalStorage("TodoCollection");

        defaults() {
            return {
                title: '',
                completed: false
            }
        }

        // getters and setters are optional, but they make it easier to work with models

        get title(): string {
            return this.get('title');
        }

        set title(value: string) {
            this.set('title', value);
        }

        get completed(): boolean {
            return this.get('completed')
        }

        set completed(value: boolean) {
            this.set('completed', value);
        }
    }

    export class TodoCollection extends Knockbone.Collection {
        model = Todo;
        localStorage = new (<any> Backbone).LocalStorage("TodoCollection");
    }
}
