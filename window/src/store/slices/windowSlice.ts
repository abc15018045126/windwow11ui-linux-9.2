import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppDefinition, OpenApp } from '../../types';

// Thunk to handle opening apps, including external ones
export const openApp = createAsyncThunk(
    'windows/openApp',
    async (appDef: AppDefinition, { dispatch }) => {
        if (appDef.isExternal && appDef.externalPath) {
            window.electronAPI.launcher.launchExternal(appDef.externalPath);
        } else {
            dispatch(windowSlice.actions._openInternalApp(appDef));
        }
    }
);

interface WindowState {
  openApps: OpenApp[];
  activeInstanceId: string | null;
  nextZIndex: number;
}

const initialState: WindowState = {
  openApps: [],
  activeInstanceId: null,
  nextZIndex: 10,
};

const windowSlice = createSlice({
  name: 'windows',
  initialState,
  reducers: {
    // Private reducer for opening internal apps
    _openInternalApp: (state, action: PayloadAction<AppDefinition>) => {
      const appDef = action.payload;
      const instanceId = `${appDef.id}-${Date.now()}`;

      const newApp: OpenApp = {
        ...appDef,
        instanceId,
        title: appDef.name,
        isMinimized: false,
        isMaximized: false,
        position: { x: 50, y: 50 },
        size: appDef.defaultSize || { width: 600, height: 400 },
        zIndex: state.nextZIndex,
      };

      state.openApps.push(newApp);
      state.activeInstanceId = instanceId;
      state.nextZIndex += 1;
    },
    closeApp: (state, action: PayloadAction<string>) => {
      state.openApps = state.openApps.filter(
        (app) => app.instanceId !== action.payload
      );
      if (state.activeInstanceId === action.payload) {
        const topApp = state.openApps.reduce(
          (top, app) => (app.zIndex > (top?.zIndex || 0) ? app : top),
          null as OpenApp | null
        );
        state.activeInstanceId = topApp ? topApp.instanceId : null;
      }
    },
    focusApp: (state, action: PayloadAction<string>) => {
        const instanceId = action.payload;
        if (state.activeInstanceId === instanceId) return;

        const app = state.openApps.find(app => app.instanceId === instanceId);
        if (app) {
            app.zIndex = state.nextZIndex;
            state.nextZIndex += 1;
            state.activeInstanceId = instanceId;
        }
    },
    updateAppPosition: (state, action: PayloadAction<{ instanceId: string; position: { x: number; y: number } }>) => {
        const { instanceId, position } = action.payload;
        const app = state.openApps.find(app => app.instanceId === instanceId);
        if (app) {
            app.position = position;
        }
    },
    updateAppSize: (state, action: PayloadAction<{ instanceId: string; size: { width: number; height: number } }>) => {
        const { instanceId, size } = action.payload;
        const app = state.openApps.find(app => app.instanceId === instanceId);
        if (app) {
            app.size = size;
        }
    },
    toggleMaximize: (state, action: PayloadAction<string>) => {
        const instanceId = action.payload;
        const app = state.openApps.find(app => app.instanceId === instanceId);
        if (app) {
            if (app.isMaximized) {
                app.isMaximized = false;
                app.position = app.previousPosition || { x: 50, y: 50 };
                app.size = app.previousSize || { width: 600, height: 400 };
            } else {
                app.previousPosition = app.position;
                app.previousSize = app.size;
                app.isMaximized = true;
                app.position = { x: 0, y: 0 };
            }
        }
    },
    toggleMinimizeApp: (state, action: PayloadAction<string>) => {
        const instanceId = action.payload;
        const app = state.openApps.find(app => app.instanceId === instanceId);
        if (app) {
            app.isMinimized = !app.isMinimized;
            if (!app.isMinimized) {
                state.activeInstanceId = instanceId;
                app.zIndex = state.nextZIndex;
                state.nextZIndex += 1;
            }
            else if (state.activeInstanceId === instanceId) {
                const topApp = state.openApps
                    .filter(a => a.instanceId !== instanceId && !a.isMinimized)
                    .reduce((top, a) => (a.zIndex > (top?.zIndex || 0) ? a : top), null as OpenApp | null);
                state.activeInstanceId = topApp ? topApp.instanceId : null;
            }
        }
    },
  },
});

export const { closeApp, focusApp, updateAppPosition, updateAppSize, toggleMaximize, toggleMinimizeApp } = windowSlice.actions;

export default windowSlice.reducer;
