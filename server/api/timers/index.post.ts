// POST /api/timers  — create or update a timer
import { upsertTimer } from '~/server/utils/timers'
import type { VacationTimer } from '~/server/utils/timers'
import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<VacationTimer>>(event)

  const timer: VacationTimer = {
    id: body.id ?? randomUUID(),
    name: body.name ?? 'Untitled',
    lightIds: body.lightIds ?? [],
    groupIds: body.groupIds ?? [],
    onTime: body.onTime ?? '18:00',
    offTime: body.offTime ?? '23:00',
    days: body.days ?? [0, 1, 2, 3, 4, 5, 6],
    enabled: body.enabled ?? true,
    randomOffsetMinutes: body.randomOffsetMinutes ?? 0,
  }

  await upsertTimer(timer)
  return timer
})
