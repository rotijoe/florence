import type { AppVariables } from '../../types/index.js'
import { Hono } from 'hono'
import * as upload from './handlers/upload.js'

const app = new Hono<{ Variables: AppVariables }>()

app.post('/users/:userId/tracks/:slug/events/:eventId/upload-url', upload.uploadUrl)
app.post('/users/:userId/tracks/:slug/events/:eventId/upload-confirm', upload.uploadConfirm)

export default app
