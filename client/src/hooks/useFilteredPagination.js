import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

export default function useFilteredPagination(items, filterFn, search) {
  const normalizedSearch = search.trim().toLowerCase();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filterToken = `${normalizedSearch}|${items.length}`;
  const [activeToken, setActiveToken] = useState(filterToken);

  const effectiveVisibleCount =
    activeToken === filterToken ? visibleCount : PAGE_SIZE;

  const filtered = useMemo(
    () => items.filter((item) => filterFn(item, normalizedSearch)),
    [items, normalizedSearch, filterFn],
  );

  const visible = filtered.slice(0, effectiveVisibleCount);
  const hasMore = effectiveVisibleCount < filtered.length;
  const remaining = Math.max(filtered.length - effectiveVisibleCount, 0);

  function loadMore() {
    setVisibleCount((count) =>
      activeToken === filterToken ? count + PAGE_SIZE : PAGE_SIZE * 2,
    );
    setActiveToken(filterToken);
  }

  return { filtered, visible, hasMore, remaining, loadMore };
}
