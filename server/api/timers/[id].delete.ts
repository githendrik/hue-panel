// DELETE /api/timers/:id
import { deleteTimer } from '~/server/utils/timers'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id required' })
  await deleteTimer(id)
  return { ok: true }
})
