import type { AppVariables } from '../../types/index.js'
import { Hono } from 'hono'
import * as me from './handlers/me.js'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/user/me', me.handler)

export default app
