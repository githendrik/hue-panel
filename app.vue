<template>
  <div class="app">
    <header class="header">
      <span class="logo">💡 <span class="logo-text">Hue Vacation Panel</span></span>
      <nav>
        <NuxtLink to="/">Dashboard</NuxtLink>
        <NuxtLink to="/timers">Timers</NuxtLink>
        <NuxtLink to="/setup">Setup</NuxtLink>
      </nav>
    </header>
    <main class="content">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
}

.app { display: flex; flex-direction: column; min-height: 100vh; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.logo { font-size: 1.1rem; font-weight: 700; color: #f59e0b; }
.logo-text { display: inline; }

/* Hide text on mobile, show only the bulb */
@media (max-width: 600px) {
  .logo-text { display: none; }
  .header { padding: 0.75rem 1rem; }
}

nav { display: flex; gap: 1.5rem; }
nav a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color .2s; }
nav a:hover, nav a.router-link-active { color: #f8fafc; }

@media (max-width: 600px) {
  nav { gap: 0.75rem; }
  nav a { font-size: 0.8rem; }
}

.content { flex: 1; padding: 2rem; max-width: 900px; margin: 0 auto; width: 100%; }

/* shared card */
.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: .75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.btn {
  padding: .5rem 1.2rem;
  border-radius: .5rem;
  border: none;
  cursor: pointer;
  font-size: .9rem;
  font-weight: 600;
  transition: opacity .2s;
}
.btn:hover { opacity: .85; }
.btn-primary { background: #f59e0b; color: #0f172a; }
.btn-danger  { background: #ef4444; color: #fff; }
.btn-ghost   { background: #334155; color: #e2e8f0; }

.badge {
  display: inline-block;
  padding: .15rem .55rem;
  border-radius: 9999px;
  font-size: .75rem;
  font-weight: 600;
}
.badge-green  { background: #16a34a33; color: #4ade80; }
.badge-red    { background: #dc262633; color: #f87171; }
.badge-yellow { background: #d9770633; color: #fbbf24; }

label { font-size: .85rem; color: #94a3b8; display: block; margin-bottom: .3rem; }
input, select {
  width: 100%;
  padding: .5rem .75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: .5rem;
  color: #e2e8f0;
  font-size: .9rem;
  margin-bottom: 1rem;
}
input:focus, select:focus { outline: 2px solid #f59e0b; border-color: transparent; }

h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: .75rem; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
