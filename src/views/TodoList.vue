<template>
  <div class="todo-list">
    <h1 class="todo-list__title">待办事项</h1>
    
    <div class="todo-list__input-wrapper">
      <input
        v-model="newTodoText"
        type="text"
        class="todo-list__input"
        placeholder="添加新任务..."
        maxlength="200"
        @keyup.enter="addTodo"
      />
      <button
        class="todo-list__add-btn"
        :disabled="!canAdd"
        @click="addTodo"
      >
        <svg class="todo-list__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        添加
      </button>
    </div>

    <div v-if="todos.length === 0" class="todo-list__empty">
      <svg class="todo-list__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>暂无待办事项</p>
    </div>

    <ul v-else class="todo-list__items">
      <li
        v-for="todo in todos"
        :key="todo.id"
        class="todo-list__item"
        :class="{ 'todo-list__item--completed': todo.completed }"
      >
        <label class="todo-list__checkbox-wrapper">
          <input
            type="checkbox"
            class="todo-list__checkbox"
            :checked="todo.completed"
            @change="toggleTodo(todo.id)"
          />
          <span class="todo-list__checkbox-custom"></span>
        </label>
        <span class="todo-list__text" :class="{ 'todo-list__text--completed': todo.completed }">
          {{ todo.text }}
        </span>
        <button
          class="todo-list__delete-btn"
          @click="deleteTodo(todo.id)"
        >
          <svg class="todo-list__delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </li>
    </ul>

    <div v-if="hasCompleted" class="todo-list__footer">
      <button class="todo-list__clear-btn" @click="clearCompleted">
        清空已完成
      </button>
    </div>
  </div>
</template>

<script>
const STORAGE_KEY = 'todo-list-data'
const MAX_ITEMS = 100

export default {
  name: 'TodoList',

  data() {
    return {
      newTodoText: '',
      todos: []
    }
  },

  computed: {
    canAdd() {
      return this.newTodoText.trim().length > 0 && this.todos.length < MAX_ITEMS
    },
    hasCompleted() {
      return this.todos.some(todo => todo.completed)
    }
  },

  created() {
    this.loadTodos()
  },

  methods: {
    loadTodos() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          this.todos = JSON.parse(stored)
        }
      } catch (e) {
        console.error('加载数据失败:', e)
      }
    },

    saveTodos() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos))
      } catch (e) {
        console.error('保存数据失败:', e)
      }
    },

    addTodo() {
      const text = this.newTodoText.trim()
      if (!text || this.todos.length >= MAX_ITEMS) {
        return
      }

      const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
      }

      this.todos.unshift(newTodo)
      this.newTodoText = ''
      this.saveTodos()
    },

    toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
        this.saveTodos()
      }
    },

    deleteTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id)
      this.saveTodos()
    },

    clearCompleted() {
      this.todos = this.todos.filter(t => !t.completed)
      this.saveTodos()
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.todo-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 48px 16px 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.todo-list__title {
  font-size: 24px;
  font-weight: 700;
  color: #134E4A;
  margin: 0 0 24px;
  text-align: center;
}

.todo-list__input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.todo-list__input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  font-size: 16px;
  font-family: inherit;
  color: #134E4A;
  background: #FFFFFF;
  border: 1px solid #CCFBF1;
  border-radius: 8px;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}

.todo-list__input::placeholder {
  color: #5EEAD4;
}

.todo-list__input:focus {
  border-color: #0D9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.todo-list__add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 500;
  font-family: inherit;
  color: #FFFFFF;
  background: #0D9488;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 150ms, transform 150ms;
}

.todo-list__add-btn:hover:not(:disabled) {
  background: #0F766E;
}

.todo-list__add-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.todo-list__add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.todo-list__icon {
  width: 18px;
  height: 18px;
}

.todo-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #5EEAD4;
}

.todo-list__empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
}

.todo-list__empty p {
  margin: 0;
  font-size: 16px;
}

.todo-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.todo-list__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 200ms;
}

.todo-list__item--completed {
  background: #A7F3D0;
}

.todo-list__checkbox-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.todo-list__checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.todo-list__checkbox-custom {
  width: 22px;
  height: 22px;
  border: 2px solid #14B8A6;
  border-radius: 50%;
  transition: all 150ms;
}

.todo-list__checkbox:checked + .todo-list__checkbox-custom {
  background: #0D9488;
  border-color: #0D9488;
}

.todo-list__checkbox:checked + .todo-list__checkbox-custom::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 10px;
  border: solid #FFFFFF;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.todo-list__checkbox:focus + .todo-list__checkbox-custom {
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2);
}

.todo-list__text {
  flex: 1;
  font-size: 16px;
  color: #134E4A;
  word-break: break-word;
}

.todo-list__text--completed {
  text-decoration: line-through;
  color: #0F766E;
}

.todo-list__delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 150ms;
}

.todo-list__delete-btn:hover {
  background: #FEF2F2;
}

.todo-list__delete-icon {
  width: 18px;
  height: 18px;
  color: #F97316;
}

.todo-list__footer {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.todo-list__clear-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  color: #F97316;
  background: transparent;
  border: 1px solid #F97316;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;
}

.todo-list__clear-btn:hover {
  background: #FEF2F2;
  color: #EA580C;
}

.todo-list__clear-btn:active {
  transform: scale(0.98);
}

@media (max-width: 640px) {
  .todo-list {
    padding: 32px 16px 24px;
  }

  .todo-list__input-wrapper {
    flex-direction: column;
  }

  .todo-list__add-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>