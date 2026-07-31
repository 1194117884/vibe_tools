# Image Multi-Convert Design

## Summary

Extend the existing single-image converter (`/pages/tools/image/index.js`) to support selecting multiple images and converting them sequentially in a queue, with a shared format/quality configuration and individual downloads.

## Motivation

Currently the tool only supports one image at a time. Users with multiple images (e.g., HEIC photos from iPhone) must convert them one by one. Multi-select with queued conversion makes this efficient.

## UI Layout

**Top: File Selection Area** (modified)
- "Select Image" button now triggers a file input with `multiple` attribute
- Accept: `image/*,.heic,.heif`
- After selection, shows file count: "5 files selected"
- Clicking again replaces the previous selection

**Middle: Shared Configuration** (unchanged)
- Output format dropdown (JPEG / PNG / WebP)
- Quality slider (0.1 - 1.0)
- Applied to all images in the queue

**Middle: Action Button** (modified)
- "Start Convert" button (replaces old "Convert Image")
- Disabled state shows overall progress: "Converting 2/5"
- Spinner alongside during conversion

**Bottom: Queue List** (new)
- Simple list, one row per file:
  - **File name**
  - **Status badge**: ⏳ Pending | 🔄 Converting | ✅ Done | ❌ Error
  - **Download button** — appears only when status is `done`
- No thumbnails (memory-conscious)

**Error Area** (unchanged)
- Global error messages shown below the action button

## Data Flow

### State (all `useState`)

| State | Type | Purpose |
|---|---|---|
| `files` | `File[]` | Selected files, replaced on each new selection |
| `queueStatus` | `Map<string, {status, output?, error?}>` | Per-file conversion state, keyed by filename |
| `currentIndex` | `number` | Index of file currently being converted (-1 = not started) |
| `isConverting` | `boolean` | Whether the queue is actively processing |

### Flow

1. User selects files → `files` populated, `queueStatus` initialized to all `pending`
2. User clicks "Start Convert" → `isConverting = true`, `currentIndex = 0`
3. Sequential loop (`useEffect` driven by `currentIndex`):
   - Set file `i` to `converting`
   - Use existing canvas-based conversion logic (HEIC → decode → canvas → target format)
   - On success: store `output` dataURL, set `done`
   - On error: store `error` message, set `error`, continue to next
   - Increment `currentIndex`
4. All done → `isConverting = false`, `currentIndex = -1`

### Memory Management

- Only current file's intermediate data (HEIC decoded blob, canvas) in memory at a time
- Converted dataURLs kept until user re-selects files (overwritten)
- On new file selection: revoke old Blob URLs, reset `queueStatus`

### Edge Cases

- **Re-selecting files during conversion**: Disabled (input hidden/disabled while `isConverting`)
- **Conversion error on one file**: Mark as `error`, continue to next file
- **All files fail**: Show error summary, allow re-try
- **Very large files**: Canvas has browser limits (~16k px); if exceeded, catch and mark as error

## Changes

### Files Modified

- `pages/tools/image/index.js` — all changes in this single file

### No New Dependencies

No new npm packages required. All logic stays in-browser using Canvas API + existing `heic2any` dynamic import.

## Out of Scope

- Per-file format/quality settings
- ZIP bulk download
- Drag-and-drop file selection (can be added later)
- Parallel conversion
- Web Worker offloading
