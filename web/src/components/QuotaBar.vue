<template>
  <div class="quota-bar">
    <div class="quota-header">
      <span class="quota-icon">{{ icon }}</span>
      <span class="quota-name">{{ name }}</span>
    </div>
    <div class="quota-body">
      <div class="progress-container">
        <div
          class="progress-bar"
          :class="barClass"
          :style="{ width: progressWidth }"
        ></div>
      </div>
      <div class="quota-info">
        <template v-if="unlimited">
          <span class="unlimited-badge">Unlimited</span>
        </template>
        <template v-else>
          <span class="used-info">{{ used }}/{{ total }}</span>
          <span class="percent-info" :class="{ warning: isWarning }">
            {{ percentRemaining.toFixed(0) }}%
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: String,
  icon: String,
  entitlement: Number,
  remaining: Number,
  percentRemaining: Number,
  unlimited: Boolean,
  warningThreshold: {
    type: Number,
    default: 20
  }
});

const used = computed(() => props.entitlement - props.remaining);
const total = computed(() => props.entitlement);
const progressWidth = computed(() => {
  if (props.unlimited) return '100%';
  return `${props.percentRemaining}%`;
});

const isWarning = computed(() => {
  return !props.unlimited && props.percentRemaining < props.warningThreshold;
});

const barClass = computed(() => {
  if (props.unlimited) return 'unlimited';
  if (isWarning.value) return 'warning';
  return 'normal';
});
</script>

<style scoped>
.quota-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quota-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.quota-icon {
  font-size: 14px;
}

.quota-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.quota-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-container {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-bar.normal {
  background: linear-gradient(90deg, var(--accent-green), #34d399);
}

.progress-bar.warning {
  background: linear-gradient(90deg, var(--accent-red), #f87171);
}

.progress-bar.unlimited {
  background: linear-gradient(90deg, var(--accent-blue), #60a5fa);
}

.quota-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.used-info {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}

.percent-info {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-green);
}

.percent-info.warning {
  color: var(--accent-red);
}

.unlimited-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-blue);
  background: rgba(59, 130, 246, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
