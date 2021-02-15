Handlebars.registerHelper("eq", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;

var util = {
  uuid: function () {
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
  pluralize: function (count, word) {
    return count === 1 ? word : word + "s";
  },
  store: function (namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  },
};

var App = {
  init: function () {
    this.todos = util.store("todos-nojquery");
    this.todoTemplate = Handlebars.compile(
      document.getElementById("todo-template").innerHTML
    );
    this.footerTemplate = Handlebars.compile(
      document.getElementById("footer-template").innerHTML
    );

    this.newTodo = document.getElementById("new-todo");
    this.todoList = document.getElementById("todo-list");
    this.toggleAllBtn = document.getElementById("toggle-all");

    this.bindEvents();

    new Router({
      "/:filter": function (filter) {
        this.filter = filter;
        this.render();
      }.bind(this),
    }).init("/all");
  },
  bindEvents: function () {
    this.newTodo.addEventListener("keyup", this.create.bind(this));
    this.toggleAllBtn.addEventListener("change", this.toggleAll.bind(this));

    var clearCompleted = document.getElementById("footer");
    clearCompleted.addEventListener("click", function () {
      var elementClicked = event.target.id;
      if (elementClicked === "clear-completed") App.destroyCompleted(event);
    });

    this.todoList.addEventListener("change", function () {
      var elementClicked = event.target;
      if (elementClicked.className === "toggle") App.toggle(event);
    });
    this.todoList.addEventListener("click", function () {
      var elementClicked = event.target;
      var numberOfClicks = event.detail;
      if (elementClicked.className === "destroy" && numberOfClicks === 1)
        App.destroy(event);
    });
    this.todoList.addEventListener("dblclick", function () {
      var elementClicked = event.target;
      var numberOfClicks = event.detail;
      if (elementClicked.tagName === "LABEL" && numberOfClicks === 2)
        App.edit(event);
    });

    this.todoList.addEventListener("keyup", this.editKeyup.bind(this));

    this.todoList.addEventListener("focusout", function () {
      var elementClicked = event.target;
      if (elementClicked.className === "edit") App.update(event);
    });
  },
  render: function () {
    var todos = this.getFilteredTodos();
    var main = document.getElementById("main");
    // todoTemplateHTML is assigned the handlebars template with the todos array passed in it.
    var todoTemplateHTML = this.todoTemplate(todos);
    this.todoList.innerHTML = todoTemplateHTML;

    //display todos list if the count is more than 1.
    if (todos.length > 0) {
      main.style.display = "block";
    } else {
      main.style.display = "none";
    }

    // active and unable state for the toggle all button.
    if (this.getActiveTodos().length === 0) {
      this.toggleAllBtn.checked = true;
    } else {
      this.toggleAllBtn.checked = false;
    }

    // this.assembleTemplate();

    this.renderFooter();
    this.newTodo.focus();
    util.store("todos-nojquery", this.todos);
  },
  renderFooter: function () {
    var todoCount = this.todos.length;
    var activeTodoCount = this.getActiveTodos().length;
    var footerTemplateHTML = this.footerTemplate({
      activeTodoCount: activeTodoCount,
      activeTodoWord: util.pluralize(activeTodoCount, "item"),
      completedTodos: todoCount - activeTodoCount,
      filter: this.filter,
    });

    var footer = document.getElementById("footer");
    if (todoCount > 0) {
      footer.style.display = "block";
      footer.innerHTML = footerTemplateHTML;
    } else {
      footer.style.display = "none";
    }
  },
  toggleAll: function (event) {
    var isChecked = event.target.checked;

    this.todos.forEach(function (todo) {
      todo.completed = isChecked;
    });

    this.render();
  },
  getActiveTodos: function () {
    return this.todos.filter(function (todo) {
      return !todo.completed;
    });
  },
  getCompletedTodos: function () {
    return this.todos.filter(function (todo) {
      return todo.completed;
    });
  },
  getFilteredTodos: function () {
    if (this.filter === "active") {
      return this.getActiveTodos();
    }

    if (this.filter === "completed") {
      return this.getCompletedTodos();
    }

    return this.todos;
  },
  destroyCompleted: function () {
    this.todos = this.getActiveTodos();
    this.filter = "all";
    this.render();
  },
  // accepts an element from inside the `.item` div and
  // returns the corresponding index in the `todos` array
  indexFromEl: function (elementClicked) {
    var id = elementClicked.closest("li").dataset.id;
    var todos = this.todos;
    var i = todos.length;

    while (i--) {
      if (todos[i].id === id) {
        return i;
      }
    }
  },
  create: function (event) {
    var input = event.target;
    var val = input.value;

    if (event.which !== ENTER_KEY || !val) {
      return;
    }

    this.todos.push({
      id: util.uuid(),
      title: val,
      completed: false,
    });

    this.newTodo.value = "";

    this.render();
  },
  toggle: function (event) {
    var i = this.indexFromEl(event.target);
    this.todos[i].completed = !this.todos[i].completed;
    this.render();
  },
  edit: function (event) {
    var todoLi = event.target.closest("li");
    todoLi.classList.add("editing");
    var input = todoLi.querySelector(".edit");
    input.focus();
  },
  editKeyup: function (event) {
    if (event.which === ENTER_KEY) {
      event.target.blur();
    }

    if (event.which === ESCAPE_KEY) {
      var setEventAttribute = event.target;
      setEventAttribute.setAttribute("abort", true);
      setEventAttribute.blur();
    }
  },
  update: function (event) {
    var el = event.target;
    var val = el.value.trim();

    if (!val && el === "input.edit") {
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
  destroy: function (event) {
    this.todos.splice(this.indexFromEl(event.target), 1);
    this.render();
  },
};
App.init();
