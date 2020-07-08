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

var elTodoUl = document.getElementById('todo-list');
var elFooter = document.getElementById('footer');

var Build = {
  template: function() {

    //cleans the HTML from the UL element, before injecting it with the new and/or updated version of the template.
    elTodoUl.innerHTML = '';

    //Build the template literal forEach item on the todos array.
    App.todos.forEach( function(todos){
      var templateTodoUl = 
      `<li id="${todos.id}" ${todos.completed ? 'class="completed"' : ''}>
        <div class="view">
          <input class="toggle" type="checkbox" ${todos.completed ? 'checked' : ''}>
          <label>${todos.title}</label>
          <button class="destroy"></button>
        </div>
      <input class="edit" value="${todos.title}">
      </li>`;

      elTodoUl.insertAdjacentHTML('beforeend', templateTodoUl);

    });

    var todoCount = App.todos.length;
    var activeTodoCount = App.getActiveTodos().length;
    var footerInfo = {
      activeTodoCount: activeTodoCount,
      activeTodoWord: util.pluralize(activeTodoCount, "item"),
      completedTodos: todoCount - activeTodoCount,
      filter: App.filter
    };
    
    elFooter.innerHTML = '';

    var footerTemplate = 
    `<span id="todo-count"> ${footerInfo.activeTodoCount}<strong> ${footerInfo.activeTodoWord} left</span>
      <ul id="filters">
          <li>
            <a ${footerInfo.filter === 'all' ? 'class="selected"' : ""} href="#/all">All</a>
          </li>
          <li>
            <a ${footerInfo.filter === 'active' ? 'class="selected"' : ""} href="#/active">Active</a>
          </li>
          <li>
            <a ${footerInfo.filter === 'completed' ? 'class="selected"' : ""} href="#/completed">Completed</a>
          </li>
      </ul>
      ${footerInfo.completedTodos > 0 ? '<button id="clear-completed">Clear completed</button>':''}`;

      elFooter.insertAdjacentHTML('beforeend', footerTemplate);
  }
};

var inputNewTodo = document.getElementById('new-todo');
var toggleAll = document.getElementById('toggle-all');
var clearCompleted = document.getElementById('footer');

var App = {
  init: function() {
    this.todos = util.store("todos");
    this.todos > 0 ? Build.template() + this.bindEvents() : (this.bindEvents())
  
    new Router({
      "/:filter": function(filter) {
        this.filter = filter;
        this.render();
      }.bind(this)
    }).init("/all");
  },
  bindEvents: function() {

    inputNewTodo.addEventListener('keyup', this.create.bind(this));

    toggleAll.addEventListener('change', this.toggleAll.bind(this));

    clearCompleted.addEventListener('click', function(){
      var elementClicked = event.target.id;
      if (elementClicked === 'clear-completed')
      App.destroyCompleted(event);
    });

    elTodoUl.addEventListener('change', function() {
      var elementClicked = event.target;
      if (elementClicked.className === 'toggle')
        App.toggle(event);
    });

    elTodoUl.addEventListener('click', function() {
      var elementClicked = event.target;
      var numberOfClicks = event.detail;
      if (elementClicked.className === 'destroy' && numberOfClicks === 1 )
        App.destroy(event);
    });

    elTodoUl.addEventListener('dblclick', function(){
      var elementClicked = event.target;
      var numberOfClicks = event.detail;
      if (elementClicked.tagName === 'LABEL' && numberOfClicks === 2 )
        App.edit(event);
    });

    elTodoUl.addEventListener('keyup', this.editKeyup.bind(this));

    elTodoUl.addEventListener('focusout', function(){
      var elementClicked = event.target;
      if (elementClicked.className === 'edit')
      App.update(event);
    });
  },
  render: function() {
    var todos = this.getFilteredTodos();
    var elMain  = document.getElementById('main');
    var toggleAllButton = document.getElementById('toggle-all');

    //Call build template every time render is ran.
    Build.template();

    if (todos.length > 0) {
      elMain.style.display = "block";
    } else {
      elMain.style.display = 'none';
    };

    if (this.getActiveTodos().length === 0) {
      toggleAllButton.checked = true;
    } else {
      toggleAllButton.checked = false;
    };

    this.renderFooter();
    inputNewTodo.focus();
    util.store("todos", this.todos);
  },
  renderFooter: function() {
    let todoCount = this.todos.length;
    
    if (todoCount > 0) {
      elFooter.style.display = 'block';
    } else {
      elFooter.style.display = 'none';
    }
  },
  toggleAll: function(event) {
    var isChecked = event.target.checked;

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
  // accepts an element from inside the `.item` div and
  // returns the corresponding index in the `todos` array
  indexFromEl: function(elementClicked) {
    var id = elementClicked.closest('li').id;
    var todos = this.todos;
    var i = todos.length;

    while (i--) {
      if (todos[i].id === id) {
        return i;
      }
    }
  },
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

    inputNewTodo.value = "";

    this.render();
  },
  toggle: function(event) {
    var i = this.indexFromEl(event.target);
    this.todos[i].completed = !this.todos[i].completed;
    this.render();
  },
  edit: function(event) {
    var elTodoLi = event.target.closest('li');
    elTodoLi.classList.add('editing');
    var input = elTodoLi.querySelector('.edit');
    input.focus();
  },
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
  update: function(event) {
    var el = event.target;
    var val = el.value.trim();

    if (!val && el === 'input.edit') {
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
  destroy: function(event) {
    this.todos.splice(this.indexFromEl(event.target), 1);
    this.render();
  }
};

App.init();
