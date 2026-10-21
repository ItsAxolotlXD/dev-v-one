export type RecallActivityType = 'tab' | 'channel' | 'article' | 'copilot' | 'note' | 'photo-captured' | 'photo-saved' | 'calculation' | 'sparkos';

export type RecallActivity = {
  id: string;
  type: RecallActivityType;
  title: string;
  source?: string;
  route?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export async function recordRecallActivity(activity: Omit<RecallActivity, 'id' | 'createdAt'>) {
  try {
    const response = await fetch('/api/recall/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
      keepalive: true,
    });
    if (response.ok) window.dispatchEvent(new Event('recall-activity-recorded'));
  } catch {
    // Activity logging must never interrupt the app flow.
  }
}

export async function getRecallActivities() {
  const response = await fetch('/api/recall/activity?limit=100', { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load Recall activity');
  return (await response.json()) as { activities: RecallActivity[] };
}
