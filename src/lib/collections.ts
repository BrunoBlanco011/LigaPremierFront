/** Indexa una lista por su `id` para búsquedas O(1). */
export function indexById<T extends { id: string }>(items: readonly T[] | undefined): Map<string, T> {
  return new Map((items ?? []).map((item) => [item.id, item]))
}
