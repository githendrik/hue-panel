// GET /api/timers
import { getTimers } from '~/server/utils/timers'

export default defineEventHandler(async () => {
  return getTimers()
})
