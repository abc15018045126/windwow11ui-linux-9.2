# Project Structure and Directory Guide

This document provides an overview of the project's directory structure, explaining the purpose and function of each major folder. This is based on the core architectural principles outlined in the main `README.md`.

## Root Level

The root directory contains configuration files and the primary folders that organize the application.

-   `.` (Root)
    -   `README.md`: **[CRITICAL]** The main project documentation outlining the core philosophy of stability and the strict architectural rules.
    -   `package.json`: Defines project metadata, dependencies, and scripts.
    -   `apps/`: Contains the source code for standalone, external applications that can be discovered and installed by the App Store.
    -   `function/`: **[CORE LOGIC]** The most critical directory. Per the architecture rules, it contains isolated business logic. In practice, this often means these functions act as clients that communicate with the backend server.
    -   `main/`: **[BACKEND]** The Electron main process, which also runs the backend Express.js server.
    -   `services/`: **[API LAYER]** The "switchboard" that connects the frontend to the backend logic in the `function` module.
    -   `window/`: **[FRONTEND]** The React-based user interface.
    -   `virtual-fs/`: A simulated filesystem for the application. (Not currently used for app state).
    -   `old/`: **[LEGACY]** Contains the previous version of the application for reference.

---

## Core Directories Explained

### `main/` (Electron Main Process & Backend Server)

This directory is the heart of the Electron application and its backend.

-   `index.ts`: The main entry point. It creates the browser window, loads the React app, handles IPC, and **starts the backend server**.
-   `preload.ts`: Exposes a secure API (`window.electronAPI`) from the main process to the frontend, which is the only way the frontend can communicate with the backend.
-   `server/`: Contains the Express.js server. This server manages the application's state, such as the list of installed applications, and exposes a REST API for the `function` modules to interact with.

### `function/` (Isolated Business Logic)

This is where all the "thinking" of the application happens.

-   `stable/`: Contains stable, immutable functions. These functions are called by the frontend (via the IPC bridge and services layer). They are often clients that `fetch` data from the backend Express server, keeping the core logic on the server and this layer clean.

### `services/` (API Interface Layer)

This directory acts as a clean, logic-less "switchboard".

-   Its sole purpose is to import functions from the `function/` directory and export them, providing a single, clean interface for the IPC bridge to use.

### `window/` (Frontend UI)

This directory contains the entire React application.

-   `src/apps/`: Contains the React components for all core, built-in applications (e.g., "Settings", "App Store").
-   `src/components/`: Contains reusable React components that make up the desktop environment (e.g., `Desktop`, `Taskbar`, `StartMenu`).
-   `src/store/`: Contains the Redux Toolkit global state management setup.

### `apps/` (Installable Applications)

This directory is a repository for the source code of external, standalone applications.

-   Each subdirectory is a self-contained application.
-   The backend server's `/api/apps/available` endpoint scans this directory to let the App Store know what can be installed.
