<template>
  <div class="app">
    <header class="header">
      <div class="header-left">
        <h1 class="title">Copilot API Monitor</h1>
        <span class="refresh-time" v-if="lastRefresh">
          {{ formatTime(lastRefresh) }}
        </span>
      </div>
      <button class="refresh-all-btn" @click="refreshAll" :disabled="loading">
        <span class="btn-icon">↻</span>
        <span>{{ loading ? 'Refreshing...' : 'Refresh All' }}</span>
      </button>
    </header>

    <main class="main">
      <div v-if="error" class="error-banner">
        <span class="error-icon">⚠</span>
        {{ error }}
      </div>

      <div v-if="accounts.length === 0 && !loading" class="empty-state">
        <p>No accounts configured</p>
        <p class="hint">Add accounts to <code>config/accounts.json</code></p>
      </div>

      <div class="accounts-grid">
        <AccountCard
          v-for="account in sortedAccounts"
          :key="account.name"
          :account="account"
          :loading="refreshingAccount === account.name"
          :warning-threshold="warningThreshold"
          :is-active="activeAccount === account.name"
          @refresh="refreshAccount(account.name)"
          @set-active="setActiveAccount(account.name)"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchAllAccounts, fetchAccount } from './api';
import AccountCard from './components/AccountCard.vue';

const accounts = ref([]);
const lastRefresh = ref(null);
const loading = ref(false);
const refreshingAccount = ref(null);
const error = ref(null);
const warningThreshold = ref(20);
const activeAccount = ref(localStorage.getItem('activeAccount') || '');

const sortedAccounts = computed(() => {
  return [...accounts.value].sort((a, b) => {
    if (a.name === activeAccount.value) return -1;
    if (b.name === activeAccount.value) return 1;
    return 0;
  });
});

onMounted(() => {
  refreshAll();
});

async function refreshAll() {
  loading.value = true;
  error.value = null;

  try {
    const data = await fetchAllAccounts();
    accounts.value = data.accounts;
    lastRefresh.value = data.timestamp;
    warningThreshold.value = data.warningThreshold || 20;
  } catch (err) {
    error.value = `Failed to fetch accounts: ${err.message}`;
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function refreshAccount(name) {
  refreshingAccount.value = name;

  try {
    const data = await fetchAccount(name);
    const index = accounts.value.findIndex(a => a.name === name);
    if (index !== -1) {
      accounts.value[index] = {
        ...accounts.value[index],
        status: data.status,
        data: data.data,
        error: data.error
      };
    }
    lastRefresh.value = data.timestamp;
  } catch (err) {
    console.error(`Failed to refresh account ${name}:`, err);
  } finally {
    refreshingAccount.value = null;
  }
}

function setActiveAccount(name) {
  if (activeAccount.value === name) {
    activeAccount.value = '';
    localStorage.removeItem('activeAccount');
  } else {
    activeAccount.value = name;
    localStorage.setItem('activeAccount', name);
  }
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString();
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg-primary: #0f1117;
  --bg-secondary: #1a1d24;
  --bg-tertiary: #252830;
  --bg-card: #1e2128;
  --border-color: #2d3139;
  --text-primary: #e4e6eb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --accent-blue: #3b82f6;
  --accent-green: #10b981;
  --accent-yellow: #f59e0b;
  --accent-red: #ef4444;
  --accent-purple: #8b5cf6;
  --accent-orange: #f97316;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.5;
}

.app {
  min-height: 100vh;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.refresh-time {
  font-size: 13px;
  color: var(--text-muted);
}

.refresh-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-blue);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-all-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.refresh-all-btn:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 16px;
}

.main {
  max-width: 1400px;
  margin: 0 auto;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--accent-red);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.error-icon {
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state .hint {
  margin-top: 8px;
  font-size: 14px;
}

.empty-state code {
  background: var(--bg-tertiary);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--accent-blue);
}

.accounts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
