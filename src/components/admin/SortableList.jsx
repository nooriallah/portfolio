"use client";
/**
 * src/components/admin/SortableList.jsx — DRAG-AND-DROP LIST FOR /admin/<collection>
 *
 * The rows you see on /admin/projects (and every other collection list).
 * Grab the ⠿ handle on the left of a row and drag it anywhere in the list —
 * first, middle, last — then let go. The new order is saved automatically
 * (server action `reorderItems` in src/lib/cms/actions.js) and the public
 * site updates immediately.
 *
 * Built on pointer events, so the SAME code works with a mouse, a trackpad
 * and a finger on a phone — no drag-and-drop library is added to the project.
 * The ↑ ↓ buttons are still there for keyboard users and precise single steps.
 *
 * WHAT TO CHANGE WHERE
 *   • row height / padding ....... the `px-4 py-3` on the <li> below
 *   • the look while dragging .... the `dragging` class strings below
 *     (ring colour, shadow, the amber drop line)
 *   • the handle icon ............ <GripVertical> from lucide-react
 *   • what each row shows ........ the row markup further down (image, title,
 *     draft badge, subtitle, Edit button, RowActions)
 */
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { GripVertical, Pencil, Check, Loader2 } from "lucide-react";
import { RowActions } from "./Forms.jsx";
import { reorderItems } from "@/lib/cms/actions.js";

/* How close to the top/bottom edge (in pixels) the pointer must get before the
   list starts scrolling by itself, and how fast it scrolls at most. */
const EDGE = 90;
const MAX_SPEED = 18;

/** Find the box that actually scrolls around this element (the admin content
    area, the frame on tablet, or the page on a phone). */
function scrollParentOf(el) {
  let node = el?.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

export default function SortableList({ collection, rows, hasImage }) {
  // `items` is the order shown on screen. It follows the server on reload,
  // but while you drag we reorder it locally so the movement feels instant.
  const [items, setItems] = useState(rows);
  const [dragId, setDragId] = useState(null); // row currently being dragged
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const listRef = useRef(null);
  const rowRefs = useRef(new Map()); // id → <li> element, used to find the drop target
  const orderAtDragStart = useRef(null);
  const pointerY = useRef(0); // last pointer position, used by the auto-scroll
  const rafId = useRef(null); // the running auto-scroll animation frame
  const scrollBox = useRef(null); // the element that scrolls while dragging
  // Always-current copy of the on-screen order. The drag finishes on a window
  // listener (see onPointerDown), which cannot read React state directly, so
  // it reads this instead.
  const itemsRef = useRef(rows);

  // If the page re-renders with fresh data from the server (after a save,
  // a delete, or a ↑ ↓ click), take that as the new truth — unless the user
  // is in the middle of a drag. This is the "adjust state while rendering"
  // pattern React recommends instead of doing it in an effect.
  const [lastRows, setLastRows] = useState(rows);
  if (rows !== lastRows && dragId == null) {
    setLastRows(rows);
    setItems(rows);
  }

  /* ---------------------------------------------------------------- *
   * Drag start — remember where we began so we can tell if anything
   * actually changed, and capture the pointer so the drag keeps working
   * even when the cursor leaves the row.
   * ---------------------------------------------------------------- */
  function onPointerDown(e, id) {
    // Ignore right-click / middle-click.
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    // Start from what is on screen right now, then keep itemsRef in step as
    // the row moves (the window listeners below cannot read React state).
    itemsRef.current = items;
    orderAtDragStart.current = items.map((r) => r.id);
    pointerY.current = e.clientY;
    scrollBox.current = scrollParentOf(listRef.current);
    setDragId(id);
    setSaved(false);
    setError("");
    startAutoScroll(id);

    // IMPORTANT: the drag is tracked on the WINDOW, not on the list.
    // As rows are reordered React moves the row elements around, which makes
    // the browser drop the pointer capture — so a pointerup that happened over
    // a moved row would never reach the list and the drop would be lost.
    // Listening on the window means the drop is always caught, even if the
    // pointer ends up outside the list entirely.
    const onMove = (ev) => {
      pointerY.current = ev.clientY;
      reposition(ev.clientY, id);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      finishDrag();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  /* ---------------------------------------------------------------- *
   * Auto-scroll — while you hold a row near the top or bottom edge of
   * the list area, the list scrolls by itself so you can drag a project
   * from the very bottom all the way to the top of a long list.
   * Speed grows the closer you get to the edge.
   * ---------------------------------------------------------------- */
  function startAutoScroll(id) {
    if (rafId.current) return;
    const step = () => {
      const box = scrollBox.current;
      if (box) {
        // Where the visible area starts/ends on screen.
        const isPage = box === document.scrollingElement || box === document.documentElement;
        const top = isPage ? 0 : box.getBoundingClientRect().top;
        const bottom = isPage ? window.innerHeight : box.getBoundingClientRect().bottom;

        const y = pointerY.current;
        let delta = 0;
        if (y - top < EDGE) delta = -Math.ceil(((EDGE - (y - top)) / EDGE) * MAX_SPEED);
        else if (bottom - y < EDGE) delta = Math.ceil(((EDGE - (bottom - y)) / EDGE) * MAX_SPEED);

        if (delta !== 0) {
          box.scrollTop += delta;
          // The rows moved under the pointer — work out the new drop slot.
          reposition(y, id);
        }
      }
      rafId.current = requestAnimationFrame(step);
    };
    rafId.current = requestAnimationFrame(step);
  }

  function stopAutoScroll() {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  }

  /* ---------------------------------------------------------------- *
   * Work out which slot the pointer is over and move the dragged row
   * there. Shared by the pointer-move handler and the auto-scroll loop.
   * ---------------------------------------------------------------- */
  function reposition(y, id) {
    setItems((current) => {
      const fromIndex = current.findIndex((r) => r.id === id);
      if (fromIndex === -1) return current;
      itemsRef.current = current;

      let toIndex = fromIndex;
      for (let i = 0; i < current.length; i++) {
        const el = rowRefs.current.get(current[i].id);
        if (!el) continue;
        const box = el.getBoundingClientRect();
        const middle = box.top + box.height / 2;
        if (i < fromIndex && y < middle) {
          toIndex = i;
          break;
        }
        if (i > fromIndex && y > middle) {
          toIndex = i;
        }
      }
      if (toIndex === fromIndex) return current;

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      itemsRef.current = next;
      return next;
    });
  }

  /* ---------------------------------------------------------------- *
   * Drag move — work out which row the pointer is over (by comparing the
   * pointer's Y position with the middle of each row) and move the dragged
   * row to that position in the list.
   * ---------------------------------------------------------------- */
  /* ---------------------------------------------------------------- *
   * Drop — stop the auto-scroll and, if the order really changed,
   * send the new order to the server.
   * ---------------------------------------------------------------- */
  function finishDrag() {
    stopAutoScroll();
    setDragId(null);

    const before = orderAtDragStart.current ?? [];
    const after = itemsRef.current.map((r) => r.id);
    const changed = before.length !== after.length || before.some((id, i) => id !== after[i]);
    if (!changed) return;

    startTransition(async () => {
      try {
        const res = await reorderItems(collection, after);
        if (res?.ok === false) throw new Error(res.error || "Could not save the new order");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        // Put the list back the way it was so the screen matches the database.
        setItems(rows);
        itemsRef.current = rows;
        setError(err.message || "Could not save the new order");
      }
    });
  }

  return (
    <>
      {/* status line — appears under the list header while saving / after saving */}
      <div className="mb-3 h-5 text-sm" aria-live="polite">
        {pending && (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Loader2 size={14} className="animate-spin" /> Saving new order…
          </span>
        )}
        {saved && !pending && (
          <span className="inline-flex items-center gap-1.5 text-accent">
            <Check size={14} /> Order saved — the site is updated.
          </span>
        )}
        {error && <span className="text-red-500">{error}</span>}
      </div>

      <ul
        ref={listRef}
        className={`divide-y divide-line-soft rounded-2xl border border-line bg-surface overflow-hidden ${
          dragId != null ? "select-none cursor-grabbing" : ""
        }`}
      >
        {items.map((r, i) => {
          const dragging = r.id === dragId;
          return (
            <li
              key={r.id}
              ref={(el) => {
                if (el) rowRefs.current.set(r.id, el);
                else rowRefs.current.delete(r.id);
              }}
              className={`flex items-center gap-3 px-4 py-3 bg-surface ${
                dragging
                  ? // the row you are holding: lifted, outlined in amber
                    "relative z-10 shadow-lg ring-2 ring-[var(--adm-amber)] rounded-xl"
                  : ""
              }`}
            >
              {/* ---- drag handle ---- */}
              <button
                type="button"
                onPointerDown={(e) => onPointerDown(e, r.id)}
                aria-label={`Drag to reorder ${r.title}`}
                title="Drag to reorder"
                className={`shrink-0 grid place-items-center w-7 h-8 rounded-md text-faint hover:text-heading hover:bg-chip touch-none ${
                  dragging ? "cursor-grabbing text-heading" : "cursor-grab"
                }`}
              >
                <GripVertical size={16} />
              </button>

              {/* position number */}
              <span className="w-5 text-xs text-faint tabular-nums">{i + 1}</span>

              {/* thumbnail (only for collections that have an image field) */}
              {hasImage &&
                (r.image ? (
                  <img
                    src={r.image}
                    alt=""
                    draggable={false}
                    className="w-14 h-10 rounded-md object-cover object-top border border-line bg-chip"
                  />
                ) : (
                  <span className="w-14 h-10 rounded-md border border-line bg-chip" />
                ))}

              {/* title + subtitle */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-heading truncate">
                  {r.title}
                  {r.draft && (
                    <span className="ms-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-chip text-muted">
                      draft
                    </span>
                  )}
                </p>
                {r.sub && <p className="text-xs text-faint truncate">{r.sub}</p>}
              </div>

              {/* edit + the ↑ ↓ 🗑 buttons */}
              <Link
                href={`/admin/${collection}/${r.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-line text-heading hover:border-accent transition"
              >
                <Pencil size={14} /> Edit
              </Link>
              <RowActions
                collection={collection}
                id={r.id}
                first={i === 0}
                last={i === items.length - 1}
                title={r.title}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
