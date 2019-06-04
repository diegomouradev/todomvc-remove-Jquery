//
// MAIN FUNCTIONS WITHOUT JQUERY
//
/* use this event listener to run functions when DOM is ready */

// document.addEventListener("DOMContentLoaded", function(event) { 
//   var App = {};
// });







/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});
	var ENTER_KEY = 13; 
	var ESCAPE_KEY = 27;

  
  //           ***util object***
  //             Functions without methods 
  //
  function uuid() {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  }
  function pluralize(count, word) {
			return count === 1 ? word : word + 's';
		}
  function store(namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  }
  
  
	var util = {}

  
  
  
  //            *App Object*
  // FUNCTIONS W/OUT METHODS
  //
    function indexFromEl(el) {
      // var id = $(el).closest('li').data('id');
      var id = el.closest('li').getAttribute('data-id');
      var todos = App.todos;
      var i = todos.length;

      while (i--) {
        if (todos[i].id === id) {
          return i;
        } 
      }
    }
    function destroy(e) {
      App.todos.splice(indexFromEl(e.target), 1);

         render();
    }
//     function update(e) {
//       var el = e.target;
//       var $el = $(el);
//       var val = $el.val().trim();

//       if (!val) {
//         destroy(e);
//         return;
//      if ($el.data('abort')) {
//         $el.data('abort', false);
//       } else {
//         App.todos[indexFromEl(el)].title = val;
//       }
//       }
//       render();
//     }
    function update(e) {
        var el = e.target;
        // var $el = $(el);
        // var val = $el.val().trim();
        var val = el.value.trim();

        if (!val) {
          destroy(e);
          return;
        }
      
        if (el.dataset.abort) {
          el.dataset.abort = false;
        } else {
          App.todos[indexFromEl(el)].title = val;
        }
        render();
    }
    function toggleAll(e) {
      var isChecked = $(e.target).prop('checked');
      App.todos.forEach(function (todo) {
        todo.completed = isChecked;
      });
      render();
    }
    function destroyCompleted() { //sets todos to active, sets filter to all,and renders
      App.todos = getActiveTodos();
      App.filter = 'all';
      render();
    }
    function getFilteredTodos() { 
			if (App.filter === 'active') {
				return getActiveTodos();
			}
			if (App.filter === 'completed') {
				return getCompletedTodos();
			}
			return App.todos;
		}
    function create(e) {
			// var $input = $(e.target);
			// var val = $input.val().trim();
			var $input = e.target;
			var val = $input.value.trim();
      if (e.which !== ENTER_KEY || !val) {
				return;
			}
			App.todos.push({
				id: uuid(),
				title: val,
				completed: false
			});
			$input.value = '';
			render();
		}
    function toggle(e) {
      var i = indexFromEl(e.target);
      App.todos[i].completed = !App.todos[i].completed;
      render();
    }
    // function edit(e) {
			// var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			// var $input = e.target.closest('li');
			// $input.className += " editing";
			// $input = $input.querySelector('.edit');
			// $input.val($input.val()).focus();
      // $input.focus();
		// } 
  
    function edit(e) {
        var $input = $(e.target).closest('li').addClass('editing').find('.edit');
        $input.val($input.val()).focus();
    } 
    function editKeyup(e) {
      var tester = e.target;
      if (e.which === ENTER_KEY) {
        e.target.blur();
      }
      if (e.which === ESCAPE_KEY) {
        // var tester = e.target;
          tester.dataset.abort = true;
          tester.blur();
      }
    }
    function edit(e) {
        var $input = $(e.target).closest('li').addClass('editing').find('.edit');
        $input.val($input.val()).focus();
    } 
    function editKeyup(e) {
      var tester = e.target;
      if (e.which === ENTER_KEY) {
				e.target.blur();
			}
			if (e.which === ESCAPE_KEY) {
        // var tester = e.target;
			    tester.dataset.abort = true;
          tester.blur();
			}
		}
    function getCompletedTodos() { //filter returns array of completed
			return App.todos.filter(function (todo) {
				return todo.completed;
			});
		}
    function getActiveTodos() {  // filter returns array of non-completed
			return App.todos.filter(function (todo) {
				return !todo.completed;
			});
		}
    function renderFooter() {
			var todoCount = App.todos.length;
			var activeTodoCount = getActiveTodos().length;
			var template = App.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: App.filter
			});
			$('#footer').toggle(todoCount > 0).html(template);
		}
    function render() {
			var todos = getFilteredTodos();
			$('#todo-list').html(App.todoTemplate(todos));
			$('#main').toggle(todos.length > 0);
			$('#toggle-all').prop('checked', getActiveTodos().length === 0);
			renderFooter();
			$('#new-todo').focus();
			store('todos-jquery', App.todos);
		}
  
    function bindEvents() {
      
      // function whatIsThis() {
      //   console.log(this);
      }
			// $('#new-todo').on('keyup', create.bind(App));
      var  new_todo = document.getElementById('new-todo');
      new_todo.addEventListener('keyup', create);  
    
      // $('#toggle-all').on('change', toggleAll.bind(App));
      var toggle_all = document.querySelector('#toggle-all');
      toggle_all.addEventListener('change', toggleAll);
      
      // $('#footer').on('click', '#clear-completed', destroyCompleted.bind(App));
      var id_footer = document.querySelector('#footer');
      id_footer.addEventListener('click', function(e) {
        if (e.target.id === 'clear-completed') {
          destroyCompleted();
        }
      });
      
      var todo_list = document.querySelector('#todo-list');
      todo_list.addEventListener('change', function(e) {
        if (e.target.className === 'toggle') {
          toggle(e);
        }
      });
      
      todo_list.addEventListener('dblclick', function(e) {
        if (e.target.nodeName === 'LABEL') {
          edit(e);
        }
      });
      
      todo_list.addEventListener('keyup', function(e) {
        if (e.target.className === 'edit') {
          editKeyup(e);
        }
      });
      
      todo_list.addEventListener('focusout', function(e) {  //trying blur event instead of focusout
        if (e.target.className === 'edit') {
          update(e);
        }
      });
      
      todo_list.addEventListener('click', function(e) {
        if (e.target.className === 'destroy') {
          destroy(e);
        }
    });
      
      // $('#todo-list')
				// .on('change', '.toggle', toggle.bind(App))
				// .on('dblclick', 'label', edit.bind(App))
				// .on('keyup', '.edit', editKeyup.bind(App))
				// .on('focusout', '.edit', update.bind(App))
				// .on('click', '.destroy', destroy.bind(App));
		
		function init() {
			App.todos = store('todos-jquery');
			App.todoTemplate = Handlebars.compile($('#todo-template').html());
			App.footerTemplate = Handlebars.compile($('#footer-template').html());
			bindEvents();
		  new Router({
				'/:filter': function (filter) {
					App.filter = filter;
					render();
				}.bind(App)
			}).init('/all');      
		} 
	 var App = {};
	 init();
});