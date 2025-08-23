Of course. Here is the English version of the comprehensive Markdown document, based on all the rules and structures you've provided.

Project Architecture & Core Design Principles
1. Core Philosophy: Absolute Stability

The design and development of this project adhere to one supreme principle: everything is for absolute system stability.

All other factors, including performance, code redundancy, and development speed, are secondary to stability. To achieve this goal, a strict, non-negotiable set of rules has been established. The core of this system is achieving a robust state through complete isolation of every part of the system, especially the core logic.

Technology Stack Overview:

Framework: Electron

Backend: Express.js

Frontend: React, React-i18next

State Management: Redux

Language: TypeScript

Bundler: Vite

Styling: Tailwind CSS, Headless UI

Code Style: Google TypeScript Style (gts), ESLint + Prettier

Communication: IPC (Inter-Process Communication)

Sentry

2. Non-Negotiable Core Rules
Rule 1: The function Module — The Bedrock of System Stability

The function/ directory is the sole location for all core business logic. It follows a unique set of rules designed to achieve perpetual stability.

Code is strictly divided into three categories:

System: The final, delivered product. Its stability is entirely dependent on the stable functions it calls.

Stable Function:

Naming Convention: FeatureNameFunction_MajorVersion_Description.

Behavior: Once published, its code, interface, and behavior are permanently fixed, never to be modified or deleted.

Dependencies: To achieve complete isolation, a stable function must not depend on any other old functions. If logic needs to be reused, the required code must be copied into the current function, making it fully self-contained. This is intentional redundancy in exchange for absolute independence and stability.

Impact: Even if a stable function were to fail, its impact would be completely isolated to itself and will not affect any other stable function.

Test Function:

Naming Convention: FeatureNameFunction_Beta_Identifier.

Purpose: Used for development and experimentation; it can be modified at any time.

Promotion: When a test function is proven to be stable and reliable, its logic is copied into a new stable function, which then follows all the rules of a stable function.

Core Tenet: The stability of the program relies on the stability of its functions, and the stability of functions relies on strict isolation by rules.

Rule 2: The services Module — A Pure API Interface Layer

The services/ directory is the only bridge connecting the system's frontend (window/) and its core logic (function/).

No Logic Allowed: Files within the services/ directory are strictly forbidden from containing any business logic, calculations, conditionals, or state.

Sole Responsibility: Its only job is to import functions from the function/ directory and export them, providing a clean, unified API gateway for the rest of the system. It is purely a "transporter" of functionality.

Rule 3: Strict Reference Scoping

A file may only reference (import) files from within its own directory, sub-directories, or the services/ directory.

The only exception is that any module in the system is permitted to reference files within services/.

It is strictly forbidden for any module (especially window/) to bypass the services layer and reference the function/ directory directly.

3. Directory Structure Explained
code
Code
download
content_copy
expand_less

.
├── .electron-vite/              # Config and cache for Electron + Vite
├── .eslintrc.cjs                # ESLint configuration for code linting
├── .prettierrc                  # Prettier configuration for code formatting
├── package.json                 # Project dependencies and scripts
├── vite.config.ts               # Vite bundler configuration
│
├── README.md                    # [CRITICAL] Project overview, mandatory reading for new members
│
├── main/                        # [BACKEND] Electron Main Process
│   ├── index.ts                 # Main process entry point: creates window, manages app lifecycle
│   ├── preload.ts               # Preload script: secure bridge for IPC
│   └── server/                  # Embedded Express server (for OAuth, etc.)
│
├── window/                      # [FRONTEND] All User Interfaces (Renderer Process)
│   └── src/
│       ├── App.tsx              # Root React component
│       ├── main.tsx             # React application entry point
│       │
│       ├── assets/              # Static assets (icons, wallpapers)
│       ├── components/          # Common UI components for the desktop environment
│       │   ├── layout/          # Overall desktop structure (Desktop, Taskbar)
│       │   └── features/        # Specific UI features (AppWindow, ContextMenu, StartMenu)
│       │
│       ├── apps/                # [CORE APPS] Standalone "applications" within the desktop
│       │   ├── FileManager/
│       │   ├── Notebook/
│       │   └── Settings/
│       │
│       ├── hooks/               # Custom React Hooks
│       ├── pages/               # Top-level pages (e.g., DesktopPage)
│       ├── store/               # Redux global state management
│       │   └── slices/          # State slices by feature (desktopSlice, windowSlice)
│       │
│       ├── lib/                 # Common frontend utility functions
│       ├── styles/              # Global styles
│       └── types/               # TypeScript type definitions
│
├── services/                    # [CORE] API Interface Layer (NO LOGIC)
│   ├── SERVICES_API.md          # [IMPORTANT] Rules for the services module
│   └── api/                     # API definitions
│
├── function/                    # [CORE] All Business Logic (Completely Isolated)
│   ├── FUNCTION_GUIDELINES.md   # [IMPORTANT] Core rules for the function module
│   │
│   ├── stable/                  # Stable functions (never modified after release)
│   │   ├── user/
│   │   └── file/
│   │
│   └── test/                    # Test functions (under development)
│       ├── user/
│       └── data/
│
├── components/                  # [Optional] Global, business-agnostic UI library components
│   └── ui/                      # (e.g., base implementations of Button, Modal)
│
└── apps/                        # [Optional] External apps or large plug-in modules
    └── reporting/
4. Guidelines for AI & Newcomers

To maintain project clarity and long-term maintainability, all contributors (including AI assistants) must adhere to the following guidelines:

Understand the Macro-Architecture (Global Vision):
Before writing any code, one must first read the root README.md and the .md files within the function/ and services/ directories to fully internalize the project's core philosophy and unchangeable rules.

Functional Classification & Modularity (Separation of Concerns):

Adhere to the Single Responsibility Principle (SRP): Every module, file, and function should be responsible for one distinct feature.

Organize by Feature: Highly related features and files must be organized into the same directory. The directory structure should clearly reflect the functional breakdown, avoiding a mix of unrelated files.

Define Clear Interfaces: Communication between modules must occur through well-defined APIs, primarily via the services layer.

Clarity at the File & Code Level ("How to use it"):

Module Documentation: At the top of each important module's directory or entry file, use a comment block to clearly explain the module's purpose, main functionalities, and how to use it.

Clear Naming Conventions: Use descriptive and consistent names for files, modules, classes, functions, and variables. Maintain a uniform style across the entire project.

Concise Comments: Use clear, simple language in comments to explain the "why," not the "what." The code itself should be self-evident in what it does.