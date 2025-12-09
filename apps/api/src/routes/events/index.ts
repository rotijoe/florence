import type { AppVariables } from '../../types/index.js'
import { Hono } from 'hono'
import * as list from './handlers/list.js'
import * as create from './handlers/create.js'
import * as detail from './handlers/detail.js'
import * as attachment from './handlers/attachment.js'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/users/:userId/tracks/:slug/events', list.handler)
app.post('/users/:userId/tracks/:slug/events', create.handler)
app.get('/users/:userId/tracks/:slug/events/:eventId', detail.get)
app.patch('/users/:userId/tracks/:slug/events/:eventId', detail.update)
app.delete('/users/:userId/tracks/:slug/events/:eventId', detail.remove)
app.delete('/users/:userId/tracks/:slug/events/:eventId/attachment', attachment.remove)

export default app
