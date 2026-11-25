export interface QaLogRef {
  origin: 'remote' | 'local';
  id: string;
}

/**
 * Keep remote (Gemini) and local bubbles in arrival order. A failed local
 * turn is removed and the cloud reply is appended after what is still there.
 */
export function mergeQaLog(
  previous: readonly QaLogRef[],
  remoteIds: readonly string[],
  localIds: readonly string[]
): QaLogRef[] {
  const remote = new Set(remoteIds);
  const local = new Set(localIds);
  const next = previous.filter((item) =>
    item.origin === 'remote' ? remote.has(item.id) : local.has(item.id)
  );
  const seen = new Set(next.map((item) => `${item.origin}:${item.id}`));

  for (const id of remoteIds) {
    const key = `remote:${id}`;
    if (seen.has(key)) continue;
    next.push({ origin: 'remote', id });
    seen.add(key);
  }
  for (const id of localIds) {
    const key = `local:${id}`;
    if (seen.has(key)) continue;
    next.push({ origin: 'local', id });
    seen.add(key);
  }
  return next;
}
