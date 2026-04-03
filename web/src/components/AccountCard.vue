<template>
  <div class="account-card" :class="{ offline: account.status === 'offline', active: isActive }">
    <!-- Card Header -->
    <div class="card-header">
      <div class="header-left">
        <h3 class="account-name">{{ account.name }}</h3>
        <span class="status-badge" :class="account.status">
          {{ account.status === 'online' ? 'Online' : 'Offline' }}
        </span>
        <span v-if="isActive" class="active-badge">Active</span>
      </div>
      <div class="header-right">
        <span class="current-time">{{ currentTime }}</span>
        <button
          class="set-active-btn"
          @click="$emit('set-active')"
          :class="{ 'is-active': isActive }"
          :title="isActive ? 'Deactivate' : 'Set as active'"
        >
          {{ isActive ? '★' : '☆' }}
        </button>
        <button class="refresh-btn" @click="$emit('refresh')" :disabled="loading" title="Refresh">
          <span :class="{ spinning: loading }">↻</span>
        </button>
      </div>
    </div>

    <!-- Offline State -->
    <div v-if="account.status === 'offline'" class="offline-state">
      <span class="error-icon">⚠</span>
      <span class="error-title">Connection Failed</span>
      <span class="error-message">{{ account.error }}</span>
    </div>

    <!-- Online State -->
    <template v-else-if="account.data">
      <!-- Account Info Row -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">User</span>
          <span class="info-value">{{ account.data.login }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Subscription</span>
          <span class="info-value plan-badge" :class="account.data.copilot_plan">
            {{ formatPlan(account.data.copilot_plan) }}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Access Type</span>
          <span class="info-value small">{{ formatAccessType(account.data.access_type_sku) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Reset Date</span>
          <span class="info-value small">{{ formatResetDate(account.data.quota_reset_date_utc) }}</span>
        </div>
      </div>

      <!-- Quotas Section -->
      <div class="quotas-section">
        <div class="section-title">Quotas</div>
        <div class="quotas-grid">
          <QuotaBar
            name="Chat"
            icon="💬"
            :entitlement="account.data.quota_snapshots?.chat?.entitlement || 0"
            :remaining="account.data.quota_snapshots?.chat?.remaining || 0"
            :percent-remaining="account.data.quota_snapshots?.chat?.percent_remaining || 100"
            :unlimited="account.data.quota_snapshots?.chat?.unlimited"
            :warning-threshold="warningThreshold"
          />
          <QuotaBar
            name="Completions"
            icon="⚡"
            :entitlement="account.data.quota_snapshots?.completions?.entitlement || 0"
            :remaining="account.data.quota_snapshots?.completions?.remaining || 0"
            :percent-remaining="account.data.quota_snapshots?.completions?.percent_remaining || 100"
            :unlimited="account.data.quota_snapshots?.completions?.unlimited"
            :warning-threshold="warningThreshold"
          />
          <QuotaBar
            name="Premium"
            icon="⭐"
            :entitlement="account.data.quota_snapshots?.premium_interactions?.entitlement || 0"
            :remaining="account.data.quota_snapshots?.premium_interactions?.remaining || 0"
            :percent-remaining="account.data.quota_snapshots?.premium_interactions?.percent_remaining || 100"
            :unlimited="account.data.quota_snapshots?.premium_interactions?.unlimited"
            :warning-threshold="warningThreshold"
          />
        </div>
      </div>

      <!-- Models Section -->
      <ModelList :models="account.data.models || []" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import QuotaBar from './QuotaBar.vue';
import ModelList from './ModelList.vue';

const props = defineProps({
  account: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  warningThreshold: {
    type: Number,
    default: 20
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

defineEmits(['refresh', 'set-active']);

const currentTime = ref('');
let timeInterval = null;

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

function updateTime() {
  currentTime.value = formatLocalTime(new Date());
}

function formatLocalTime(date) {
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' ' + getTimezoneAbbr();
}

function getTimezoneAbbr() {
  const date = new Date();
  const timezone = date.toLocaleTimeString('en-US', { timeZoneName: 'short' });
  return timezone.split(' ').pop();
}

function formatPlan(plan) {
  if (!plan) return 'Unknown';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function formatAccessType(type) {
  if (!type) return 'Unknown';
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatResetDate(utcString) {
  if (!utcString) return 'Unknown';
  const date = new Date(utcString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' ' + getTimezoneAbbr();
}
</script>

<style scoped>
.account-card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 20px;
  transition: all 0.2s ease;
}

.account-card:hover {
  border-color: #3d4250;
}

.account-card.active {
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3);
}

.account-card.offline {
  border-color: var(--accent-red);
  background: rgba(239, 68, 68, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-time {
  font-size: 12px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  color: var(--text-muted);
}

.account-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.online {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-green);
}

.status-badge.offline {
  background: rgba(239, 68, 68, 0.15);
  color: var(--accent-red);
}

.active-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(249, 115, 22, 0.15);
  color: var(--accent-orange);
}

.set-active-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.set-active-btn:hover {
  color: var(--accent-orange);
  border-color: var(--accent-orange);
}

.set-active-btn.is-active {
  color: var(--accent-orange);
  background: rgba(249, 115, 22, 0.1);
  border-color: var(--accent-orange);
}

.refresh-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--accent-blue);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn .spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.info-value.small {
  font-size: 12px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  color: var(--text-secondary);
}

.plan-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.plan-badge.individual {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-blue);
}

.plan-badge.business {
  background: rgba(139, 92, 246, 0.15);
  color: var(--accent-purple);
}

.plan-badge.enterprise {
  background: rgba(245, 158, 11, 0.15);
  color: var(--accent-yellow);
}

.quotas-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quotas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.offline-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  text-align: center;
}

.error-icon {
  font-size: 32px;
}

.error-title {
  font-size: 16px;
  font-weight: 600;
  color: #fca5a5;
}

.error-message {
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quotas-grid {
    grid-template-columns: 1fr;
  }

  .header-left, .header-right {
    flex-wrap: wrap;
  }
}
</style>
