import type { AppVariables } from '../../types/index.js'
import { Hono } from 'hono'
import * as me from './handlers/me.js'
import * as upcomingAppointments from './handlers/upcoming_appointments.js'
import * as hubNotifications from './handlers/hub_notifications.js'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/users/:userId', me.handler)
app.get('/users/:userId/appointments/upcoming', upcomingAppointments.handler)
app.get('/users/:userId/hub/notifications', hubNotifications.getHubNotifications)
app.post('/users/:userId/hub/notifications/dismiss', hubNotifications.dismissHubNotification)

export default app
