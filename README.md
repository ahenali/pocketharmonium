# Pocket Harmonium

Play a real recorded Indian harmonium in your browser — sargam keyboard, reed
stacking, chord detection, metronome, recording, and a raag guide.

![Pocket Harmonium demo](assets/demo.gif)

**Live demo:** https://pocketharmonium.vercel.app

## Raag Guide

The Raag Guide highlights the notes of ten common raags on the keyboard. To
unlock it:

1. Click **Go Premium** (or **See premium**) in the app.
2. Under **Have an unlock code?**, enter:

   ```
   SURPETI-RAAG-2026
   ```

3. Click **Unlock**. The code is not case-sensitive, and it is remembered in
   your browser.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, SSR)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) components (Radix UI primitives)
- [Nitro](https://nitro.build) server build

## Development

You'll need [Bun](https://bun.sh) (or Node.js 20+ with npm) installed.

```sh
bun install
bun run dev
```

The app runs at http://localhost:3000 by default.

## Available scripts

```sh
bun run dev        # start the dev server
bun run build       # production build
bun run preview     # preview the production build locally
bun run lint         # run 
