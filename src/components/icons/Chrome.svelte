<script lang="ts" module>
  /**
   * The app's chrome icons, redrawn from Lucide's shapes — the same set the
   * interface uses, so the drawing on this page can be mistaken for the app.
   */
  export type ChromeName =
    | 'panel'
    | 'panel-close'
    | 'library'
    | 'dictionary'
    | 'search'
    | 'palette'
    | 'menu'
    | 'thumbnails'
    | 'outline'
    | 'note'
    | 'settings'
    | 'folder'
    | 'book-open'
    | 'minimise'
    | 'maximise'
    | 'close';
</script>

<script lang="ts">
  interface Props {
    name: ChromeName;
    size?: number;
  }
  let { name, size = 17 }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  {#if name === 'panel'}
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M9 3v18" />
  {:else if name === 'panel-close'}
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M9 3v18" />
    <path d="m17 9-2.6 3L17 15" />
  {:else if name === 'library'}
    <rect x="3" y="3" width="6" height="18" rx="1.4" />
    <path d="M13 3v18" />
    <path d="m18 3.4 3.2 17" />
  {:else if name === 'dictionary'}
    <path d="M4.5 19.2A2.5 2.5 0 0 1 7 16.7h12.5V3.4a1 1 0 0 0-1-1H6.6A2.1 2.1 0 0 0 4.5 4.5z" />
    <path d="M4.5 19.2a2.5 2.5 0 0 0 2.5 2.5h12" />
    <path d="m9.4 12.6 2.6-5 2.6 5" />
    <path d="M10.4 10.7h3.2" />
  {:else if name === 'search'}
    <circle cx="11" cy="11" r="7.2" />
    <path d="m20.5 20.5-4.2-4.2" />
  {:else if name === 'palette'}
    <path
      d="M12 21.6a9.6 9.6 0 1 1 0-19.2c5.3 0 9.6 3.4 9.6 7.7 0 2.4-1.9 4.3-4.3 4.3h-2.4a1.9 1.9 0 0 0-1.9 1.9v1.4a1.9 1.9 0 0 0 1.9 1.9z"
    />
    <circle cx="8" cy="9.2" r="1" fill="currentColor" stroke="none" />
    <circle cx="12.6" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.8" cy="9.6" r="1" fill="currentColor" stroke="none" />
  {:else if name === 'menu'}
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  {:else if name === 'thumbnails'}
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  {:else if name === 'outline'}
    <path d="M12 4.5h8" />
    <path d="M12 9.5h8" />
    <path d="M12 14.5h8" />
    <path d="M12 19.5h8" />
    <path d="M8 4.5H4v7h4" />
    <path d="M4 11.5v8h4" />
  {:else if name === 'note'}
    <path d="M14 3.5H6.6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10.8a2 2 0 0 0 2-2V8.9z" />
    <path d="M14 3.5V9h5.4" />
  {:else if name === 'settings'}
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    />
  {:else if name === 'folder'}
    <path d="M3.6 8.2V6.4a1.8 1.8 0 0 1 1.8-1.8h3.1l2 2.2h6.9a1.8 1.8 0 0 1 1.8 1.8v1" />
    <path d="M3.6 8.2h15.9a1 1 0 0 1 1 1.2l-1.2 7.4a2 2 0 0 1-2 1.7H5.8a2 2 0 0 1-2-1.7L3.6 8.2z" />
  {:else if name === 'book-open'}
    <path d="M12 6.6C10.5 4.9 8.6 4 6.2 4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1c2.4 0 4.3.8 5.8 2.4z" />
    <path d="M12 6.6C13.5 4.9 15.4 4 17.8 4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1c-2.4 0-4.3.8-5.8 2.4z" />
  {:else if name === 'minimise'}
    <path d="M5 12h14" />
  {:else if name === 'maximise'}
    <rect x="5.5" y="5.5" width="13" height="13" rx="1.6" />
  {:else if name === 'close'}
    <path d="m6 6 12 12M18 6 6 18" />
  {/if}
</svg>

<style>
  svg {
    display: block;
    flex: none;
  }
</style>
