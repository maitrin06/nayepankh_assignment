import { db } from './firebase';

export const logActivity = async (userId: string | null, action: string, details: string) => {
  try {
    const logId = Math.random().toString(36).substring(7);
    const logData = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    await db.collection('activityLogs').doc(logId).set(logData);
    console.log(`[ACTIVITY LOG] ${new Date().toLocaleTimeString()} -> User ${userId || 'SYSTEM'}: ${action} - ${details}`);
    return { id: logId, ...logData };
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
};