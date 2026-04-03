<template>
  <div class="model-list">
    <div class="section-header" @click="toggleExpand">
      <div class="header-left">
        <span class="section-icon">📋</span>
        <span class="section-title">Available Models</span>
        <span class="model-count">{{ models.length }}</span>
      </div>
      <span class="expand-icon" :class="{ expanded }">▼</span>
    </div>

    <div v-if="expanded" class="model-content">
      <div v-for="(group, vendor) in groupedModels" :key="vendor" class="vendor-group">
        <div class="vendor-header" @click="toggleVendor(vendor)">
          <span class="vendor-name">{{ vendor }}</span>
          <span class="vendor-count">{{ group.length }}</span>
          <span class="vendor-expand" :class="{ expanded: expandedVendors.includes(vendor) }">▼</span>
        </div>
        <div v-if="expandedVendors.includes(vendor)" class="model-items">
          <div
            v-for="model in group"
            :key="model.id"
            class="model-item"
          >
            <span class="model-name">{{ model.display_name }}</span>
            <div class="model-id-wrapper">
              <code class="model-id">{{ model.id }}</code>
              <button
                class="copy-btn"
                @click.stop="copyModelId(model.id)"
                :title="copiedId === model.id ? 'Copied!' : 'Copy model ID'"
              >
                {{ copiedId === model.id ? '✓' : '⧉' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  models: {
    type: Array,
    default: () => []
  }
});

const expanded = ref(false);
const expandedVendors = ref([]);
const copiedId = ref('');

const groupedModels = computed(() => {
  const groups = {};
  props.models.forEach(model => {
    const vendor = model.owned_by || 'Unknown';
    if (!groups[vendor]) {
      groups[vendor] = [];
    }
    groups[vendor].push(model);
  });
  return Object.keys(groups).sort().reduce((acc, key) => {
    acc[key] = groups[key].sort((a, b) => a.display_name.localeCompare(b.display_name));
    return acc;
  }, {});
});

function toggleExpand() {
  expanded.value = !expanded.value;
}

function toggleVendor(vendor) {
  const index = expandedVendors.value.indexOf(vendor);
  if (index === -1) {
    expandedVendors.value.push(vendor);
  } else {
    expandedVendors.value.splice(index, 1);
  }
}

async function copyModelId(id) {
  try {
    await navigator.clipboard.writeText(id);
    copiedId.value = id;
    setTimeout(() => {
      copiedId.value = '';
    }, 1500);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = id;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      copiedId.value = id;
      setTimeout(() => {
        copiedId.value = '';
      }, 1500);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
    document.body.removeChild(textArea);
  }
}
</script>

<style scoped>
.model-list {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
  margin-top: 4px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 12px;
  margin: -8px -12px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.section-header:hover {
  background: var(--bg-tertiary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 14px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.model-count {
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 2px 8px;
  border-radius: 10px;
}

.expand-icon {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.model-content {
  margin-top: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.model-content::-webkit-scrollbar {
  width: 6px;
}

.model-content::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.model-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.vendor-group {
  margin-bottom: 8px;
}

.vendor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  transition: background 0.2s ease;
}

.vendor-header:hover {
  background: #2d3139;
}

.vendor-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.vendor-count {
  font-size: 11px;
  color: var(--text-muted);
}

.vendor-expand {
  margin-left: auto;
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.vendor-expand.expanded {
  transform: rotate(180deg);
}

.model-items {
  padding: 4px 0 4px 8px;
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.model-item:hover {
  background: var(--bg-tertiary);
}

.model-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.model-id-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.model-id {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}

.copy-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--bg-tertiary);
  color: var(--accent-green);
  border-color: var(--accent-green);
}
</style>
