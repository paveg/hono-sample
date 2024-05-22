import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator'
import { Bindings } from '../bindings.d.ts';
import { createTodo, CreateTodo, deleteTodo, fetchTodo, fetchTodos, updateTodo, UpdateTodo } from './model';

const todos = new Hono<Bindings>();;

const schema = z.object({
  title: z.string().nonempty(),
  done: z.boolean().optional(),
});

todos
  .get('/', async (c) => {
    const todos = await fetchTodos(c.env.HONO_SAMPLE);
    return c.json(todos)
  })
  .post('/', zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.text('Bad Request', 400)
    }
  }),
    async (c) => {
      const param = await c.req.json<CreateTodo>();
      const newTodo = await createTodo(c.env.HONO_SAMPLE, param)

      return c.json(newTodo, 201);
    }
  )
  .put('/:id', async (c) => {
    const id = c.req.param('id');
    const todo = await fetchTodo(c.env.HONO_SAMPLE, id)
    if (!todo) {
      return c.json({ message: 'Not found' }, 404)
    }

    const param = await c.req.json<UpdateTodo>();
    await updateTodo(c.env.HONO_SAMPLE, id, param);
    return new Response(null, { status: 204 });
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    const todo = await fetchTodo(c.env.HONO_SAMPLE, id)
    if (!todo) {
      return c.json({ message: 'Not found' }, 404)
    }

    await deleteTodo(c.env.HONO_SAMPLE, id);

    return new Response(null, { status: 204 });
  })

export { todos }
