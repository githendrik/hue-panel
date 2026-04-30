// GET /api/lights/groups  — list rooms and zones
import { hueGet } from '~/server/utils/hue'

interface HueRoom {
  id: string
  metadata: { name: string; archetype: string }
  type: string
}

interface HueResponse<T> {
  data: T[]
  errors: unknown[]
}

export default defineEventHandler(async () => {
  const [rooms, zones] = await Promise.all([
    hueGet<HueResponse<HueRoom>>('/resource/room'),
    hueGet<HueResponse<HueRoom>>('/resource/zone'),
  ])
  return [
    ...rooms.data.map(r => ({ id: r.id, name: r.metadata.name, type: 'room' as const })),
    ...zones.data.map(z => ({ id: z.id, name: z.metadata.name, type: 'zone' as const })),
  ]
})
