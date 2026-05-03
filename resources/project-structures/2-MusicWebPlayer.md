# Music Web Player — Project Structure

```
2-MusicWebPlayer/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── jest.config.js
├── jest.setup.js
├── eslint.config.mjs
├── typedoc.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── AddSongForm.tsx
│   │   ├── Controls.tsx
│   │   ├── Player.tsx
│   │   ├── Playlist.tsx
│   │   ├── PlaylistItem.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TrackInfo.tsx
│   │   └── VolumeControl.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePlaylist.ts
│   │   └── useResourceLoader.ts
│   ├── types/
│   │   ├── playback-error.ts
│   │   ├── playback-modes.ts
│   │   ├── song.ts
│   │   └── validation.ts
│   ├── utils/
│   │   ├── audio-validator.ts
│   │   ├── env.ts
│   │   ├── error-handler.ts
│   │   ├── indexed-db-storage.ts
│   │   └── time-formatter.ts
│   ├── data/
│   │   └── playlist-data-provider.ts
│   └── styles/
│       ├── main.css
│       ├── AddSongForm.module.css
│       ├── Controls.module.css
│       ├── Player.module.css
│       ├── Playlist.module.css
│       ├── ProgressBar.module.css
│       ├── TrackInfo.module.css
│       └── VolumeControl.module.css
└── tests/
    ├── App.test.tsx
    ├── main.test.tsx
    ├── components/
    │   ├── AddSongForm.test.tsx
    │   ├── Controls.test.tsx
    │   ├── Player.test.tsx
    │   ├── Playlist.test.tsx
    │   ├── PlaylistItem.test.tsx
    │   ├── ProgressBar.test.tsx
    │   ├── TrackInfo.test.tsx
    │   └── VolumeControl.test.tsx
    ├── hooks/
    │   ├── useAudioPlayer.test.ts
    │   ├── useLocalStorage.test.ts
    │   ├── usePlaylist.test.ts
    │   └── useResourceLoader.test.ts
    ├── types/
    │   ├── playback-error.test.ts
    │   ├── playback-modes.test.ts
    │   ├── song.test.ts
    │   └── validation.test.ts
    └── utils/
        ├── audio-validator.test.ts
        ├── error-handler.test.ts
        ├── indexed-db-storage.test.ts
        └── time-formatter.test.ts
```
