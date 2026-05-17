# Respuesta

### Respuesta {toggle="true"}
```markdown
Plan: I'll review the actual `Playlist` implementation, score it against your checklist, list issues (critical + minor), and provide small copy-ready fixes you can apply.

File reviewed: src/components/Playlist.tsx

**Total Score:** 9.28 / 10  
- **Design (30%)**: 9.5 — 2.85  
- **Code Quality (25%)**: 9.0 — 2.25  
- **Requirements (25%)**: 9.5 — 2.375  
- **Maintainability (10%)**: 9.0 — 0.90  
- **Best Practices (10%)**: 9.0 — 0.90

**Executive Summary**
- Clean, well-typed presentational component. Renders songs with thumbnail/title/artist, supports keyboard selection, delete-with-confirmation, empty state, and integrates the add-song form. Accessibility and event handling are good overall. A few small hardening improvements are recommended (timeout cleanup, aria-current, semantic ordered list).

**Critical Issues (Blockers)**
- None. Component is functional and safe to integrate.

**High-priority (small) fixes**
- **Clear confirmation timer on unmount**: `setTimeout` used to reset `deleteConfirmId` is never cleared; add a `useRef` to store timer ID and clear it in a cleanup effect to avoid leaks or unexpected behavior.
- **Use stable timer check**: inside the timeout you compare `deleteConfirmId === id` using the state captured at creation — better to check current state via ref or clear timer on interactions to avoid race conditions.
- **Add `aria-current` to current item**: add `aria-current="true"` for the active list item so screen readers announce current song.
- **Prefer semantic ordered list (`ol`)**: since tracks are numbered, `ol` is more semantic than `ul` (optional but recommended).
- **Consider changing li role to native button**: you currently use `role="button"` and keyboard handlers on `li`. Using a real `button` inside the `li` (or an interactive element) is slightly more robust for accessibility; optional.

**Minor suggestions**
- Extract the fallback cover path to a constant.
- Consider wrapping the playlist item markup in a small `PlaylistItem` component for readability and easier unit tests.
- Optionally `React.memo` the component to avoid re-renders if `songs` and `currentSongIndex` are stable.

**Copy-ready patch snippets**

1) Add timer ref + cleanup (apply inside src/components/Playlist.tsx):

```ts
import React, { useState, useRef, useEffect } from 'react';

// inside component
const deleteTimerRef = useRef<number | null>(null);

const handleDeleteClick = (event: React.MouseEvent, id: string): void => {
  event.stopPropagation();

  if (deleteConfirmId === id) {
    props.onRemoveSong(id);
    setDeleteConfirmId(null);
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  } else {
    setDeleteConfirmId(id);

    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }
    deleteTimerRef.current = window.setTimeout(() => {
      setDeleteConfirmId((current) => (current === id ? null : current));
      deleteTimerRef.current = null;
    }, 3000);
  }
};

useEffect(() => {
  return () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }
  };
}, []);
```

2) Add `aria-current` and prefer `<ol>` (replace the `<ul>` block):

```tsx
{/* Song list */}
<ol className={styles.playlist__items}>
  {songs.map((song, index) => {
    const isActive = index === props.currentSongIndex;
    return (
      <li
        key={song.id}
        className={`${styles.playlist__item} ${isActive ? styles['playlist__item--active'] : ''}`}
        onClick={() => handleSongClick(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, index)}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`${song.title} by ${song.artist}${isActive ? ' (currently playing)' : ''}`}
      >
        ...
      </li>
    );
  })}
</ol>
```

3) (Optional) Extract default cover constant:

```ts
const DEFAULT_COVER = '/covers/default-cover.jpg';

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
  event.currentTarget.src = DEFAULT_COVER;
  event.currentTarget.alt = 'Default album cover';
};
```

Why these changes:
- The timer ref + cleanup prevents memory/time leaks and race conditions.
- `aria-current` improves screen-reader semantics for the “current” item.
- `ol` better represents ordered tracks semantically.
- Constant for default cover avoids magic strings.

**Tests / checks to run after patch**
- Confirm delete confirm flow still works and timer clears on unmount.
- Keyboard activation (Enter/Space) still plays item.
- Screen reader announces the current item (verify `aria-current`).
- Visual behavior unchanged (styles unaffected).

Decision: APPROVED — ready for integration.
```