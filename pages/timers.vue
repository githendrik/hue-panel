<template>
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
      <h1 style="margin:0">Vacation Timers</h1>
      <button class="btn btn-primary" @click="openNew">+ New Timer</button>
    </div>

    <div v-if="timers.length === 0" class="card">
      <p style="color:#64748b">No timers yet. Click "+ New Timer" to create one.</p>
    </div>

    <div v-for="t in timers" :key="t.id" class="card">
      <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
        <span class="badge" :class="t.enabled ? 'badge-green' : 'badge-red'">{{ t.enabled ? 'Enabled' : 'Disabled' }}</span>
        <strong style="flex:1">{{ t.name }}</strong>
        <span style="color:#94a3b8;font-size:.85rem">{{ t.onTime }} ON / {{ t.offTime }} OFF</span>
        <span style="color:#64748b;font-size:.8rem">{{ dayLabel(t.days) }}</span>
        <button class="btn btn-ghost" style="padding:.3rem .8rem;font-size:.8rem" @click="edit(t)">Edit</button>
        <button class="btn btn-danger" style="padding:.3rem .8rem;font-size:.8rem" @click="remove(t.id)">Delete</button>
      </div>
      <div style="margin-top:.5rem;font-size:.8rem;color:#64748b">
        <span v-if="t.lightIds.length">Lights: {{ t.lightIds.length }}</span>
        <span v-if="t.groupIds.length" style="margin-left:.75rem">Groups: {{ t.groupIds.length }}</span>
        <span v-if="t.randomOffsetMinutes" style="margin-left:.75rem">±{{ t.randomOffsetMinutes }}min random</span>
        <span v-if="t.startDate || t.endDate" style="margin-left:.75rem">📅 {{ t.startDate || '…' }} to {{ t.endDate || '…' }}</span>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editing ? 'Edit Timer' : 'New Timer' }}</h2>

        <label>Name</label>
        <input v-model="form.name" placeholder="Living room vacation" />

        <div class="grid-2">
          <div>
            <label>Turn ON at</label>
            <input v-model="form.onTime" type="time" />
          </div>
          <div>
            <label>Turn OFF at</label>
            <input v-model="form.offTime" type="time" />
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label>Start date (optional)</label>
            <input v-model="form.startDate" type="date" />
          </div>
          <div>
            <label>End date (optional)</label>
            <input v-model="form.endDate" type="date" />
          </div>
        </div>

        <label>Random offset (±minutes for natural look)</label>
        <input v-model.number="form.randomOffsetMinutes" type="number" min="0" max="60" />

        <label>Days</label>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">
          <button
            v-for="(day, i) in DAY_NAMES"
            :key="i"
            class="btn"
            :class="form.days.includes(i) ? 'btn-primary' : 'btn-ghost'"
            style="padding:.3rem .7rem;font-size:.8rem"
            @click="toggleDay(i)"
          >{{ day }}</button>
        </div>

        <label>Lights</label>
        <div style="max-height:150px;overflow-y:auto;margin-bottom:1rem">
          <label v-for="l in lights" :key="l.id" style="display:flex;align-items:center;gap:.5rem;color:#e2e8f0;margin-bottom:.35rem">
            <input type="checkbox" :value="l.id" v-model="form.lightIds" style="width:auto;margin:0" />
            {{ l.name }}
          </label>
        </div>

        <label>Groups (rooms/zones)</label>
        <div style="max-height:120px;overflow-y:auto;margin-bottom:1rem">
          <label v-for="g in groups" :key="g.id" style="display:flex;align-items:center;gap:.5rem;color:#e2e8f0;margin-bottom:.35rem">
            <input type="checkbox" :value="g.id" v-model="form.groupIds" style="width:auto;margin:0" />
            {{ g.name }} <span style="color:#64748b;font-size:.75rem">({{ g.type }})</span>
          </label>
        </div>

        <label style="display:flex;align-items:center;gap:.5rem;color:#e2e8f0;margin-bottom:1rem">
          <input type="checkbox" v-model="form.enabled" style="width:auto;margin:0" />
          Enabled
        </label>

        <p v-if="saveError" style="color:#f87171;margin-bottom:.75rem">{{ saveError }}</p>

        <div style="display:flex;gap:.75rem;justify-content:flex-end">
          <button class="btn btn-ghost" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationTimer } from '~/server/utils/timers'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const { data: timers, refresh: refreshTimers } = await useFetch<VacationTimer[]>('/api/timers', { default: () => [] })
const { data: lights } = await useFetch<{ id: string; name: string; on: boolean }[]>('/api/lights', { default: () => [] })
const { data: groups } = await useFetch<{ id: string; name: string; type: string }[]>('/api/lights/groups', { default: () => [] })

const showModal = ref(false)
const editing = ref<string | null>(null)
const saving = ref(false)
const saveError = ref('')

const emptyForm = (): Partial<VacationTimer> => ({
  name: '',
  onTime: '18:00',
  offTime: '23:00',
  startDate: '',
  endDate: '',
  days: [0, 1, 2, 3, 4, 5, 6],
  lightIds: [],
  groupIds: [],
  enabled: true,
  randomOffsetMinutes: 10,
})
const form = ref(emptyForm())

function openNew() {
  editing.value = null
  form.value = emptyForm()
  saveError.value = ''
  showModal.value = true
}

function edit(t: VacationTimer) {
  editing.value = t.id
  form.value = { ...t, lightIds: [...t.lightIds], groupIds: [...t.groupIds], days: [...t.days] }
  saveError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

function toggleDay(i: number) {
  const days = form.value.days!
  const idx = days.indexOf(i)
  if (idx >= 0) days.splice(idx, 1)
  else days.push(i)
}

async function save() {
  saving.value = true
  saveError.value = ''
  try {
    await $fetch('/api/timers', { method: 'POST', body: form.value })
    await $fetch('/api/timers/reload', { method: 'POST' })
    await refreshTimers()
    closeModal()
  } catch (e: any) {
    saveError.value = e?.data?.message ?? e.message ?? 'Save failed'
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Delete this timer?')) return
  await $fetch(`/api/timers/${id}`, { method: 'DELETE' })
  await $fetch('/api/timers/reload', { method: 'POST' })
  await refreshTimers()
}

function dayLabel(days: number[]) {
  if (days.length === 7) return 'Every day'
  return days.map(d => DAY_NAMES[d]).join(', ')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: .75rem;
  padding: 2rem;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
