/*global jQuery, Handlebars, Router */
//Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.
jQuery(function($) {
  "use strict";

  Handlebars.registerHelper("eq", function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;

  var util = {
    uuid: function() {
      /*jshint bitwise:false */
      var i, random;
      var uuid = "";

      for (i = 0; i < 32; i++) {
        random = (Math.random() * 16) | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += "-";
        }
        uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(
          16
        );
      }

      return uuid;
    },
    pluralize: function(count, word) {
      return count === 1 ? word : word + "s";
    },
    store: function(namespace, data) {
      if (arguments.length > 1) {
        return localStorage.setItem(namespace, JSON.stringify(data));
      } else {
        var store = localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
      }
    }
  };
  
  var newTodo; //assigned on bindEvent
  var toggleAll; //assigned on bindEvents
  var clearCompleted; //assigned on bindEvents
  const todoList = document.getElementById('todo-list');

  var App = {
    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    init: function() {
      this.todos = util.store("todos-jquery");
      this.todoTemplate = Handlebars.compile(document.getElementById("todo-template").innerHTML);
      this.footerTemplate = Handlebars.compile(document.getElementById("footer-template").innerHTML);
      this.bindEvents();

      new Router({
        "/:filter": function(filter) {
          this.filter = filter;
          this.render();
        }.bind(this)
      }).init("/all");
    },

    bindEvents: function() {
      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
      // var declared outside of the object.
      newTodo = document.getElementById('new-todo');
      newTodo.addEventListener('keyup', this.create.bind(this));
      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
      // var declared outside of the object.
      toggleAll = document.getElementById('toggle-all');
      toggleAll.addEventListener('change', this.toggleAll.bind(this));
      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
      clearCompleted = document.getElementById('footer');
      clearCompleted.addEventListener('click', this.destroyCompleted.bind(this));
      //const todoList declared outside of the object for global scope.

      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED    
      todoList.addEventListener('change', function() {
        var elementClicked = event.target;
        if (elementClicked.className === 'toggle')
          App.toggle(event);
      });
      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
      todoList.addEventListener('click', function() {
        var elementClicked = event.target;
        var numberOfClicks = event.detail;
        if (elementClicked.className === 'destroy' && numberOfClicks === 1 )
          App.destroy(event);
      });
      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
      todoList.addEventListener('dblclick', function(){
        var elementClicked = event.target;
        var numberOfClicks = event.detail;
        if (elementClicked.tagName === 'LABEL' && numberOfClicks === 2 )
          App.edit(event);
      });
      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
      todoList.addEventListener('keyup', this.editKeyup.bind(this));
      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
      todoList.addEventListener('focusout', this.update.bind(this));

    },


    render: function() {
      var todos = this.getFilteredTodos();
      // var main  = document.getElementById('main');
      // window.getComputedStyle(main);

      // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
      var todoTemplateHTML = this.todoTemplate(todos);
      todoList.innerHTML = todoTemplateHTML;
      
      // if (todos > 0) {
      //   main.removeAttribute('display');
      // }
      
      $("#main").toggle(todos.length > 0);
      $("#toggle-all").prop("checked", this.getActiveTodos().length === 0);
      this.renderFooter();
      $("#new-todo").focus();
      util. store("todos-jquery", this.todos);
    },


    renderFooter: function() {
      var todoCount = this.todos.length;
      var activeTodoCount = this.getActiveTodos().length;
      var template = this.footerTemplate({
        activeTodoCount: activeTodoCount,
        activeTodoWord: util.pluralize(activeTodoCount, "item"),
        completedTodos: todoCount - activeTodoCount,
        filter: this.filter
      });

      $("#footer")
        .toggle(todoCount > 0)
        .html(template);
    },

    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    toggleAll: function(event) {
      var isChecked = event.target.hasOwnProperty("checked");

      this.todos.forEach(function(todo) {
        todo.completed = isChecked;
      });

      this.render();
    },


    getActiveTodos: function() {
      return this.todos.filter(function(todo) {
        return !todo.completed;
      });
    },
    getCompletedTodos: function() {
      return this.todos.filter(function(todo) {
        return todo.completed;
      });
    },


    getFilteredTodos: function() {
      if (this.filter === "active") {
        return this.getActiveTodos();
      }

      if (this.filter === "completed") {
        return this.getCompletedTodos();
      }

      return this.todos;
    },


    destroyCompleted: function() {
      this.todos = this.getActiveTodos();
      this.filter = "all";
      this.render();
    },

    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    // accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		indexFromEl: function(elementClicked) {
			var id = elementClicked.closest('li').dataset.id;
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
    },


    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    create: function(event) {
      var input = event.target;
      var val = input.value;

      if (event.which !== ENTER_KEY || !val) {
        return;
      }

      this.todos.push({
        id: util.uuid(),
        title: val,
        completed: false
      });

      newTodo.value = "";

      this.render();
    },


    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    toggle: function(event) {
      var i = this.indexFromEl(event.target);
      this.todos[i].completed = !this.todos[i].completed;
      this.render();
    },

    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    edit: function(event) {
      var todoLi = event.target.closest('li');
      todoLi.classList.add('editing');
      var input = todoLi.querySelector('.edit');//.classList.add('editing');
      // var input = document.getElementsByClassName('edit');
			input.focus();
    },
    
    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    editKeyup: function(event) {
      if (event.which === ENTER_KEY) {
        event.target.blur();
      }

      if (event.which === ESCAPE_KEY) {
        var setEventAttribute = event.target;
        setEventAttribute.setAttribute("abort", true);
        setEventAttribute.blur();
      }
    },

    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    update: function(event) {
      var el = event.target;
      var val = el.value.trim();

      if (!val) {
        this.destroy(event);
        return;
      }

      if (el.getAttribute("abort") === true) {
        el.setAttribute("abort", false);
      } else {
        this.todos[this.indexFromEl(event.target)].title = val;
      }

      this.render();
    },


    // JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED --**-- JQUERY REMOVED
    destroy: function(event) {
      this.todos.splice(this.indexFromEl(event.target), 1);
      this.render();
    }
  };

  App.init();
});
