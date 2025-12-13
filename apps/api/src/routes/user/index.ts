import type { AppVariables } from '../../types/index.js'
import { Hono } from 'hono'
import * as me from './handlers/me.js'
import * as upcomingAppointments from './handlers/upcoming_appointments.js'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/user/me', me.handler)
app.get('/user/appointments/upcoming', upcomingAppointments.handler)

export default app
