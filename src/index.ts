import { Hono } from 'hono';
import { todos } from './todos/api';
import { basicAuth } from 'hono/basic-auth'

const app = new Hono();
app
  .use(
    '/api/*',
    basicAuth({
      username: 'example',
      password: 'password'
    })
  )
  .get('/', (c) => c.json({ message: 'Hello, world!' }))
  .route('/api/todos', todos)

export default app;
