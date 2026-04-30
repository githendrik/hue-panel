<template>
  <div>
    <h1>Setup</h1>

    <div class="card">
      <h2>Bridge Status</h2>
      <p v-if="bridge?.configured" style="margin-bottom:1rem">
        <span class="badge badge-green">Configured</span>
        <span style="margin-left:.75rem;color:#94a3b8">{{ bridge.ip }}</span>
      </p>
      <p v-else style="color:#f87171;margin-bottom:1rem">Not configured yet.</p>

      <h2>Discover Bridges</h2>
      <p style="color:#94a3b8;font-size:.85rem;margin-bottom:.75rem">
        Scans via Philips cloud, mDNS, and local probe. Click a result to pre-fill the IP.
      </p>
      <button class="btn btn-ghost" :disabled="discovering" @click="discover" style="margin-bottom:1rem">
        {{ discovering ? 'Scanning…' : 'Scan Network' }}
      </button>

      <div v-if="discovered.length" style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.25rem">
        <button
          v-for="b in discovered"
          :key="b.ip"
          class="btn btn-ghost"
          style="display:flex;align-items:center;gap:.75rem;justify-content:flex-start"
          @click="ip = b.ip"
        >
          <span style="font-weight:700;color:#f8fafc">{{ b.ip }}</span>
          <span v-if="b.id" style="color:#64748b;font-size:.8rem">{{ b.id }}</span>
          <span class="badge badge-yellow" style="margin-left:auto;font-size:.7rem">{{ b.source }}</span>
        </button>
      </div>
      <p v-else-if="scanDone && !discovered.length" style="color:#f87171;font-size:.85rem;margin-bottom:1rem">
        No bridges found automatically. Enter the IP manually below.
      </p>

      <h2>Pair with Bridge</h2>
      <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">
        1. Press the physical <strong style="color:#fbbf24">link button</strong> on your Hue bridge.<br>
        2. Enter the bridge IP below and click Pair within 30 seconds.
      </p>

      <label>Bridge IP address</label>
      <input v-model="ip" placeholder="192.168.1.x" />

      <button class="btn btn-primary" :disabled="pairing || !ip" @click="pair">
        {{ pairing ? 'Pairing…' : 'Pair Bridge' }}
      </button>

      <p v-if="pairError" style="color:#f87171;margin-top:.75rem">{{ pairError }}</p>
      <p v-if="pairSuccess" style="color:#4ade80;margin-top:.75rem">Paired successfully!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const ip = ref('')
const pairing = ref(false)
const pairError = ref('')
const pairSuccess = ref(false)

const discovering = ref(false)
const scanDone = ref(false)
const discovered = ref<{ ip: string; id?: string; source: string }[]>([])

const { data: bridge, refresh } = await useFetch('/api/bridge')

async function discover() {
  discovering.value = true
  scanDone.value = false
  discovered.value = []
  try {
    discovered.value = await $fetch<{ ip: string; id?: string; source: string }[]>('/api/bridge/discover')
    scanDone.value = true
    if (discovered.value.length === 1) {
      ip.value = discovered.value[0].ip
    }
  } finally {
    discovering.value = false
  }
}

async function pair() {
  if (!ip.value) return
  pairing.value = true
  pairError.value = ''
  pairSuccess.value = false
  try {
    await $fetch('/api/bridge/pair', { method: 'POST', body: { ip: ip.value } })
    pairSuccess.value = true
    await refresh()
  } catch (e: any) {
    pairError.value = e?.data?.message ?? e.message ?? 'Pairing failed'
  } finally {
    pairing.value = false
  }
}
</script>
