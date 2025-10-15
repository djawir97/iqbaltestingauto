/**
 * 本地存储管理工具
 * 用于保存和读取用户设置
 */

const STORAGE_KEYS = {
  WEBHOOK_URL: 'autoediting-webhook-url',
  USER_SETTINGS: 'autoediting-user-settings'
} as const;

export interface UserSettings {
  webhookUrl?: string;
  savedAt?: string;
}

/**
 * 保存 webhook URL 到本地存储
 */
export function saveWebhookUrl(url: string): void {
  try {
    const settings: UserSettings = {
      webhookUrl: url,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, url);
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save webhook URL:', error);
  }
}

/**
 * 从本地存储读取 webhook URL
 */
export function getWebhookUrl(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL);
  } catch (error) {
    console.error('Failed to get webhook URL:', error);
    return null;
  }
}

/**
 * 获取完整的用户设置
 */
export function getUserSettings(): UserSettings {
  try {
    const settingsStr = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (settingsStr) {
      return JSON.parse(settingsStr);
    }
  } catch (error) {
    console.error('Failed to get user settings:', error);
  }
  
  return {};
}

/**
 * 清除保存的 webhook URL
 */
export function clearWebhookUrl(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.WEBHOOK_URL);
    localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
  } catch (error) {
    console.error('Failed to clear webhook URL:', error);
  }
}

/**
 * 检查是否有保存的 webhook URL
 */
export function hasSavedWebhookUrl(): boolean {
  return getWebhookUrl() !== null;
}