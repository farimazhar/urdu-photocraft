# Urdu PhotoCraft Studio 2.0 🎨
> **Photoshop for Urdu** — A professional, browser-based graphic design studio built specifically for authentic Urdu typography, poetry cards, calligraphy, and social media designs.

[![Live Demo](https://img.shields.io/badge/Live-urdu--photocraft.vercel.app-blue)](https://urdu-photocraft.vercel.app)
[![Architecture](https://img.shields.io/badge/Architecture-Feature--First-emerald)](#folder-structure)
[![Theme System](https://img.shields.io/badge/Design_System-apptheme-gold)](#apptheme-system)

---

## ✨ Key Features

- **🖋️ Authentic Urdu Typography Engine**:
  - Multiple Google & Urdu font families: `Noto Nastaliq Urdu`, `Gulzar`, `Amiri`, `Aref Ruqaa`, and `Noto Sans Arabic`.
  - Multi-layer text manipulation: move, drag, rotate, scale, and adjust layer hierarchy.
  - Multi-color text stroke outlines and glowing multi-layer drop shadows for crystal-clear readability.
  - Dual-tone gradient text fills (Royal Gold, Emerald, Neon Cyan).
  - Background highlight ribbons for subtitles and video captions.
- **📜 Curated Urdu Poetry & Quotes Library**:
  - Built-in searchable library featuring timeless verses from **Allama Muhammad Iqbalؒ**, **Mirza Ghalibؔ**, **Faiz Ahmad Faizؔ**, **Ahmad Farazؔ**, and **Parveen Shakirؔ**.
  - Quranic Ayats, Hadith wisdom, Jummah Mubarak, and Eid greetings.
  - 1-click insertion directly onto the canvas with pre-styled Nastaliq typography and author signatures!
- **✨ Islamic Calligraphy Stamps & Decorative Borders**:
  - Instant vector stamps: *Bismillah*, *Mashallah*, *Alhamdulillah*, *Subhanallah*, *Darood Sharif*, *Jummah Mubarak*, and *Eid Mubarak*.
  - Traditional Urdu floral dividers, diamond ornaments, and ornate frame borders.
- **🖼️ Canvas & Background Engine**:
  - Preset aspect ratios: **Instagram Post (1:1)**, **Story / Reel / TikTok (9:16)**, **YouTube Thumbnail (16:9)**, **Urdu Poetry Card (4:3)**, and **Portrait (3:4)**.
  - 20+ Curated gradients (Royal Obsidian, Imperial Gold, Sunset Crimson, Midnight Cyber).
  - Custom photo uploader with real-time adjustments: **Darkness Overlay** (ensures Urdu text stands out), **Blur**, **Brightness**, **Contrast**, and **Vignette**.
- **⌨️ Virtual Urdu Phonetic Keyboard**:
  - Built-in on-screen Urdu helper keyboard for users without Urdu keyboards installed on their Windows/Mac system.
- **📑 Multi-Layer Inspector**:
  - Visual layer stack with visibility toggle, layer lock, duplication, reordering, opacity control, and deletion.
- **💾 High-Resolution 4K Export**:
  - Export in **PNG**, **JPEG**, or **WebP** at **1x Standard**, **2x Ultra HD (4K)**, or **3x Print Ready**.
  - **1-Click Copy to Clipboard** for instant sharing on WhatsApp, Twitter, and Facebook.
- **↶ Unlimited Undo / Redo**:
  - State snapshot history with full keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).

---

## 🎨 AppTheme System (`apptheme/`)

Urdu PhotoCraft features a dedicated, professional CSS design token architecture located in `apptheme/`:

1. **Dark Studio (Obsidian Pro - Default)**: Deep slate obsidian `#0b0f19` with electric cyan accents and glassmorphism panels.
2. **Royal Gold (Shaan-e-Urdu)**: Rich dark espresso `#120e0a` with metallic brass & warm gold `#f5c97a` accents.
3. **Midnight Emerald (Quranic Jade)**: Deep forest obsidian `#07130e` with vibrant Quranic emerald `#10b981` highlights.

Switch themes seamlessly in real-time from the top navigation bar!

---

## 📂 Folder Structure (Feature-First Architecture)

The codebase strictly follows a **Feature-First** modular architecture:

```
urdu-photocraft/
├── index.html                   # Main Photoshop-style studio workbench layout
├── main.js                      # Central application coordinator & event bindings
├── package.json                 # Dev server configuration
├── README.md                    # Project documentation
│
├── apptheme/                    # 🎨 AppTheme Design System
│   ├── colors.css               # Color tokens & theme skins (Studio, Gold, Emerald)
│   ├── typography.css           # Urdu Nastaliq & Latin typography scales
│   ├── components.css           # Buttons, range sliders, pickers, inputs, modals
│   ├── workbench.css            # Studio layout (Top bar, Left toolbar, Viewport, Inspector)
│   ├── theme.css                # Master theme stylesheet bundle
│   └── theme.js                 # Theme switcher & localStorage persistence
│
├── core/                        # ⚙️ Core Infrastructure
│   ├── event_bus.js             # Decoupled Pub/Sub event system
│   ├── state.js                 # Reactive application state store
│   └── history_manager.js       # Undo / Redo snapshot stack
│
└── features/                    # 🚀 Feature-First Modules
    ├── canvas/                  # Canvas rendering & viewport engine
    │   ├── canvas_presets.js    # 1:1, 9:16, 16:9, 4:3 social aspect ratios
    │   ├── canvas_renderer.js   # High-DPI canvas drawing engine
    │   └── canvas_view.js       # Viewport zoom, pan, hit-testing & interactive handles
    ├── text_editor/             # Urdu Typography Engine
    │   ├── text_layer.js        # Text layer model & factory
    │   ├── text_styling.js      # Font families, sizes, alignments
    │   ├── text_effects.js      # Stroke outlines, drop shadows, gradient fills
    │   └── urdu_keyboard.js     # On-screen Urdu phonetic helper keyboard
    ├── poetry_library/          # Urdu Poetry & Presets Library
    │   ├── poetry_data.js       # Curated Iqbal, Ghalib, Faiz & Islamic couplets
    │   └── poetry_modal.js      # Searchable poetry modal with 1-click canvas insert
    ├── background_manager/      # Background & Photo Filter Engine
    │   ├── bg_colors.js         # Curated dark/vibrant gradients & solid palettes
    │   ├── bg_uploader.js       # Image file loader
    │   └── bg_filters.js        # Blur, overlay, brightness, vignette sliders
    ├── stickers_frames/         # Calligraphy & Decorative Elements
    │   ├── calligraphy_stamps.js# Vector calligraphy (Bismillah, Mashallah, Eid)
    │   └── decorative_borders.js# Traditional ornate dividers & frames
    ├── layer_panel/             # Layer Management System
    │   └── layer_list.js        # Layer hierarchy, reorder, lock, hide & delete
    └── export_share/            # High-Resolution Export Engine
        ├── export_modal.js      # PNG, JPEG, WebP exporter with 4K resolution multipliers
        └── clipboard_helper.js  # Direct "Copy to Clipboard" integration
```

---

## 🚀 Getting Started

### Option 1: Direct in Browser (Zero Build Step)
Open `index.html` directly in any modern web browser or serve it using any local static file server.

### Option 2: Using Vite Dev Server
```bash
# Install dependencies (Vite)
npm install

# Start local development server with hot-reload
npm run dev
```

---

## 🛠️ Built With

- **HTML5 Canvas API** (High-DPI 4K rendering)
- **Vanilla Modern JavaScript (ES Modules)**
- **Custom CSS Design Tokens (`apptheme/`)**
- **Google Fonts**: Noto Nastaliq Urdu, Gulzar, Amiri, Aref Ruqaa, Plus Jakarta Sans

---

## 📄 License

MIT License © 2026 [umais-codes](https://github.com/umais-codes)
