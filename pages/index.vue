<template>
  <div>
    <h1>Dashboard</h1>

    <div v-if="!bridgeOk" class="card">
      <p style="color:#f87171">Bridge not configured. <NuxtLink to="/setup">Set it up →</NuxtLink></p>
    </div>

    <template v-else>
      <div class="card" style="display:flex;align-items:center;gap:1rem">
        <span class="badge badge-green">Connected</span>
        <span style="color:#94a3b8;font-size:.9rem">Bridge: {{ bridgeIp }}</span>
        <button class="btn btn-ghost" style="margin-left:auto" @click="refresh">Refresh</button>
      </div>

      <h2>Lights</h2>
      <div class="grid-2">
        <div v-for="light in lights" :key="light.id" class="card" style="display:flex;align-items:center;gap:.75rem;padding:1rem">
          <span
            :style="`width:14px;height:14px;border-radius:50%;background:${light.on ? '#fbbf24' : '#334155'};flex-shrink:0`"
          />
          <span style="flex:1;font-size:.9rem">{{ light.name }}</span>
          <span class="badge" :class="light.on ? 'badge-yellow' : 'badge-red'">{{ light.on ? 'On' : 'Off' }}</span>
        </div>
      </div>

      <h2 style="margin-top:1.5rem">Active Timers</h2>
      <div v-if="enabledTimers.length === 0" class="card">
        <p style="color:#64748b">No active timers. <NuxtLink to="/timers">Create one →</NuxtLink></p>
      </div>
      <div v-for="t in enabledTimers" :key="t.id" class="card" style="display:flex;align-items:center;gap:1rem;padding:1rem">
        <span class="badge badge-green">Active</span>
        <span style="flex:1">{{ t.name }}</span>
        <span style="color:#94a3b8;font-size:.85rem">{{ t.onTime }} → {{ t.offTime }}</span>
        <span style="color:#64748b;font-size:.8rem">{{ dayLabel(t.days) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const { data: bridge } = await useFetch('/api/bridge')
const bridgeOk = computed(() => bridge.value?.configured)
const bridgeIp = computed(() => bridge.value?.ip)

const { data: lights, refresh: refreshLights } = await useFetch('/api/lights', {
  default: () => [],
})
const { data: timers } = await useFetch('/api/timers', {
  default: () => [],
})

const enabledTimers = computed(() => (timers.value ?? []).filter((t: any) => t.enabled))

function dayLabel(days: number[]) {
  if (days.length === 7) return 'Every day'
  return days.map(d => DAY_NAMES[d]).join(', ')
}

function refresh() {
  refreshLights()
}
</script>
