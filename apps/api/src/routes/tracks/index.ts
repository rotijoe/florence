import type { AppVariables } from '../../types/index.js'
import { Hono } from 'hono'
import * as get from './handlers/get.js'
import * as create from './handlers/create.js'
import * as deleteHandler from './handlers/delete.js'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/users/:userId/tracks/:slug', get.handler)
app.post('/users/:userId/tracks', create.handler)
app.delete('/users/:userId/tracks/:slug', deleteHandler.handler)

export default app
