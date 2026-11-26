import * as SecureStore from 'expo-secure-store';

const BOOKMARKS_KEY = 'candidate_bookmarked_jobs';

let memoryBookmarks: Set<string> = new Set();
let initialized = false;

async function init() {
  if (initialized) return;
  try {
    const raw = await SecureStore.getItemAsync(BOOKMARKS_KEY);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      memoryBookmarks = new Set(parsed);
    }
  } catch {
    // Ignore store error
  }
  initialized = true;
}

export async function isJobBookmarked(jobId: string): Promise<boolean> {
  await init();
  return memoryBookmarks.has(jobId);
}

export async function toggleJobBookmark(jobId: string): Promise<boolean> {
  await init();
  const next = !memoryBookmarks.has(jobId);
  if (next) {
    memoryBookmarks.add(jobId);
  } else {
    memoryBookmarks.delete(jobId);
  }
  try {
    await SecureStore.setItemAsync(BOOKMARKS_KEY, JSON.stringify(Array.from(memoryBookmarks)));
  } catch {
    // Ignore store error
  }
  return next;
}

export function isJobBookmarkedSync(jobId: string): boolean {
  return memoryBookmarks.has(jobId);
}
