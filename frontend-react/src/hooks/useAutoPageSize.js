import { useEffect, useRef, useState } from 'react';

// Estimated height of one row in these tables: `py-3.5` padding (14px top
// + 14px bottom) + 13px text at its default line-height + a 1px top
// border. This is an approximation rather than a live measurement of a
// real row, because the page size has to be decided BEFORE the first
// fetch even happens — there's no row rendered yet to measure on the very
// first load.
const ROW_HEIGHT = 48;

// Rough height of everything else that shares vertical space with the
// rows on these pages: the column header row + the table's own top
// padding, the pagination bar underneath, and the page's bottom padding.
// If rows end up slightly too many (a scrollbar appears) or too few (a
// visible gap remains) on a given screen, this is the one number to
// adjust — nudge it up to fit fewer rows, down to fit more.
const CHROME_HEIGHT = 170;

const MIN_ROWS = 5;

// Figures out how many table rows can fit between a container (attach the
// returned `containerRef` to the Card wrapping the table) and the bottom
// of the browser window, and recalculates whenever the window is resized
// — maximizing or restoring the browser fires the same 'resize' event as
// manually dragging an edge, so both are covered by the one listener.
export function useAutoPageSize() {
  const containerRef = useRef(null);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let debounceTimer;

    function recalculate() {
      const el = containerRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const available = window.innerHeight - top - CHROME_HEIGHT;
      setPageSize(Math.max(MIN_ROWS, Math.floor(available / ROW_HEIGHT)));
    }

    function onResize() {
      // Debounced — recalculating (and re-fetching from the API) on every
      // single pixel while someone drags a window edge would fire dozens
      // of requests a second.
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(recalculate, 150);
    }

    recalculate();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return { containerRef, pageSize };
}
