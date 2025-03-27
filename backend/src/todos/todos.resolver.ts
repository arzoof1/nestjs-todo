import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { TodosService } from './todos.service';
import { TodoType, CreateTodoInput, UpdateTodoInput } from './dto/todo.dto';
import { NotFoundException } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';

@Resolver(() => TodoType)
export class TodosResolver {
  constructor(
    private readonly todosService: TodosService,
    private readonly logger: LoggerService,
  ) {}

  @Query(() => [TodoType], { name: 'todos' })
  async getTodos() {
    this.logger.log('GraphQL Query: todos', 'TodosResolver');
    return this.todosService.findAll();
  }

  @Query(() => TodoType, { name: 'todo', nullable: true })
  async getTodoById(@Args('id', { type: () => ID }) id: string) {
    this.logger.log(`GraphQL Query: todo with id: ${id}`, 'TodosResolver');
    const todo = await this.todosService.findById(id);

    if (!todo) {
      this.logger.warn(`Todo with id: ${id} not found`, 'TodosResolver');
      throw new NotFoundException(`Todo with id: ${id} not found`);
    }

    return todo;
  }

  @Mutation(() => TodoType)
  async createTodo(@Args('createTodoInput') createTodoInput: CreateTodoInput) {
    this.logger.log(
      `GraphQL Mutation: createTodo with data: ${JSON.stringify(createTodoInput)}`,
      'TodosResolver',
    );
    return this.todosService.create(createTodoInput);
  }

  @Mutation(() => TodoType)
  async updateTodo(@Args('updateTodoInput') updateTodoInput: UpdateTodoInput) {
    this.logger.log(
      `GraphQL Mutation: updateTodo with data: ${JSON.stringify(updateTodoInput)}`,
      'TodosResolver',
    );

    const todo = await this.todosService.update(
      updateTodoInput.id,
      updateTodoInput,
    );

    if (!todo) {
      this.logger.warn(
        `Todo with id: ${updateTodoInput.id} not found for update`,
        'TodosResolver',
      );
      throw new NotFoundException(
        `Todo with id: ${updateTodoInput.id} not found`,
      );
    }

    return todo;
  }

  @Mutation(() => Boolean)
  async deleteTodo(@Args('id', { type: () => ID }) id: string) {
    this.logger.log(
      `GraphQL Mutation: deleteTodo with id: ${id}`,
      'TodosResolver',
    );

    const result = await this.todosService.delete(id);

    if (!result) {
      this.logger.warn(
        `Todo with id: ${id} not found for deletion`,
        'TodosResolver',
      );
      throw new NotFoundException(`Todo with id: ${id} not found`);
    }

    return result;
  }
}
