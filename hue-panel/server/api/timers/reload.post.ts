// POST /api/timers/reload  — no-op kept for API compatibility, scheduling is tick-based
export default defineEventHandler(async () => {
  return { ok: true }
})
