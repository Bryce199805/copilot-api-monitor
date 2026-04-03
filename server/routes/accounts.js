import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config path - can be overridden via environment variable
const configPath = process.env.CONFIG_PATH || join(__dirname, '../../config/accounts.json');

// 获取账户配置
async function getAccountConfig() {
  try {
    const data = await readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read accounts config:', error);
    return { accounts: [], warningThreshold: 20 };
  }
}

// 获取单个账户的数据
async function fetchAccountData(account) {
  const { name, endpoint } = account;

  try {
    // 并发获取 usage 和 models
    const [usageResponse, modelsResponse] = await Promise.all([
      fetch(`${endpoint}/usage`),
      fetch(`${endpoint}/v1/models`)
    ]);

    if (!usageResponse.ok) {
      throw new Error(`Usage API returned ${usageResponse.status}`);
    }
    if (!modelsResponse.ok) {
      throw new Error(`Models API returned ${modelsResponse.status}`);
    }

    const usage = await usageResponse.json();
    const models = await modelsResponse.json();

    return {
      name,
      endpoint,
      status: 'online',
      data: {
        login: usage.login,
        copilot_plan: usage.copilot_plan,
        access_type_sku: usage.access_type_sku,
        quota_reset_date: usage.quota_reset_date,
        quota_reset_date_utc: usage.quota_reset_date_utc,
        quota_snapshots: usage.quota_snapshots,
        models: models.data || []
      }
    };
  } catch (error) {
    return {
      name,
      endpoint,
      status: 'offline',
      error: error.message
    };
  }
}

// GET /api/accounts - 获取所有账户数据
router.get('/', async (req, res) => {
  try {
    const config = await getAccountConfig();
    const { accounts, warningThreshold } = config;

    // 并发获取所有账户数据
    const accountPromises = accounts.map(fetchAccountData);
    const accountsData = await Promise.all(accountPromises);

    res.json({
      timestamp: new Date().toISOString(),
      warningThreshold,
      accounts: accountsData
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts data' });
  }
});

// GET /api/accounts/:name - 获取单个账户数据
router.get('/:name', async (req, res) => {
  try {
    const config = await getAccountConfig();
    const account = config.accounts.find(a => a.name === req.params.name);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const accountData = await fetchAccountData(account);
    res.json({
      timestamp: new Date().toISOString(),
      ...accountData
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account data' });
  }
});

export default router;
