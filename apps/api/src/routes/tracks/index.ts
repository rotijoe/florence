import type { AppVariables } from '../../types/index.js'
import { Hono } from 'hono'
import * as get from './handlers/get.js'
import * as create from './handlers/create.js'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/users/:userId/tracks/:slug', get.handler)
app.post('/user/tracks', create.handler)

export default app
