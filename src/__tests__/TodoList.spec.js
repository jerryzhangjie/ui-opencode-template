import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TodoList from '@/views/TodoList.vue'

describe('TodoList.vue', () => {
  let wrapper

  beforeEach(() => {
    localStorage.clear()
    wrapper = shallowMount(TodoList)
  })

  it('renders empty state correctly', () => {
    expect(wrapper.find('.todo-list__title').text()).toBe('待办事项')
    expect(wrapper.find('.todo-list__empty').exists()).toBe(true)
  })

  it('renders input and add button', () => {
    expect(wrapper.find('.todo-list__input').exists()).toBe(true)
    expect(wrapper.find('.todo-list__add-btn').exists()).toBe(true)
  })

  it('cannot add todo when input is empty', () => {
    expect(wrapper.vm.canAdd).toBe(false)
  })

  it('can add todo when input has text', async () => {
    wrapper.setData({ newTodoText: 'Test todo' })
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.canAdd).toBe(true)
    
    wrapper.vm.addTodo()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.todos.length).toBe(1)
    expect(wrapper.vm.todos[0].text).toBe('Test todo')
    expect(wrapper.vm.newTodoText).toBe('')
  })

  it('adds todo to the top of list', async () => {
    wrapper.setData({ newTodoText: 'First' })
    await wrapper.vm.$nextTick()
    wrapper.vm.addTodo()
    await wrapper.vm.$nextTick()
    
    wrapper.setData({ newTodoText: 'Second' })
    await wrapper.vm.$nextTick()
    wrapper.vm.addTodo()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.todos[0].text).toBe('Second')
    expect(wrapper.vm.todos[1].text).toBe('First')
  })

  it('trims whitespace from input', async () => {
    wrapper.setData({ newTodoText: '  Spaces  ' })
    await wrapper.vm.$nextTick()
    
    wrapper.vm.addTodo()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.todos[0].text).toBe('Spaces')
  })

  it('can toggle todo completion status', async () => {
    wrapper.setData({ newTodoText: 'Toggle test' })
    await wrapper.vm.$nextTick()
    wrapper.vm.addTodo()
    await wrapper.vm.$nextTick()
    
    const todoId = wrapper.vm.todos[0].id
    expect(wrapper.vm.todos[0].completed).toBe(false)
    
    wrapper.vm.toggleTodo(todoId)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.todos[0].completed).toBe(true)
  })

  it('can delete a todo', async () => {
    wrapper.setData({ newTodoText: 'Delete test' })
    await wrapper.vm.$nextTick()
    wrapper.vm.addTodo()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.todos.length).toBe(1)
    
    const todoId = wrapper.vm.todos[0].id
    wrapper.vm.deleteTodo(todoId)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.todos.length).toBe(0)
  })

  it('can clear all completed todos', async () => {
    wrapper.setData({ 
      todos: [
        { id: 1, text: 'Todo 1', completed: true },
        { id: 2, text: 'Todo 2', completed: false }
      ]
    })
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.hasCompleted).toBe(true)
    expect(wrapper.find('.todo-list__clear-btn').exists()).toBe(true)
    
    wrapper.vm.clearCompleted()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.todos.length).toBe(1)
    expect(wrapper.vm.todos[0].text).toBe('Todo 2')
  })

  it('does not show clear button when no completed todos', () => {
    expect(wrapper.find('.todo-list__clear-btn').exists()).toBe(false)
  })

  it('does not add empty todo', () => {
    wrapper.setData({ newTodoText: '' })
    wrapper.vm.addTodo()
    expect(wrapper.vm.todos.length).toBe(0)
  })

  it('does not add whitespace-only todo', () => {
    wrapper.setData({ newTodoText: '   ' })
    wrapper.vm.addTodo()
    expect(wrapper.vm.todos.length).toBe(0)
  })
})