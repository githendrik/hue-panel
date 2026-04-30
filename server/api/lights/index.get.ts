// GET /api/lights  — list all lights from the bridge
import { hueGet } from '~/server/utils/hue'

interface HueLight {
  id: string
  metadata: { name: string; archetype: string }
  on: { on: boolean }
  dimming?: { brightness: number }
  color_temperature?: { mirek: number }
  owner: { rid: string; rtype: string }
}

interface HueResponse<T> {
  data: T[]
  errors: unknown[]
}

export default defineEventHandler(async () => {
  const res = await hueGet<HueResponse<HueLight>>('/resource/light')
  return res.data.map(l => ({
    id: l.id,
    name: l.metadata.name,
    on: l.on.on,
    brightness: l.dimming?.brightness ?? null,
  }))
})
