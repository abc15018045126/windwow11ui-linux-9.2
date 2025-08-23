import { createAsyncThunk } from '@reduxjs/toolkit';
import { openApp } from '../slices/windowSlice';
import appDefinitions from '../../apps';
import { AppDefinition } from '../../types';

interface FilesystemItem {
    name: string;
    path: string;
    type: 'file' | 'folder';
}

export const openItem = createAsyncThunk(
    'windows/openItem',
    async (item: FilesystemItem, { dispatch, getState }) => {
        if (item.type === 'folder') {
            const appDef = appDefinitions.find(app => app.id === 'fileExplorer');
            if (appDef) {
                dispatch(openApp({ ...appDef, initialData: { initialPath: item.path } }));
            }
            return;
        }

        if (item.name.endsWith('.app')) {
            const appInfo = await window.electronAPI.filesystem.readAppFile(item.path);
            if (appInfo && appInfo.appId) {
                const baseAppDef = appDefinitions.find(app => app.id === appInfo.appId);
                if (baseAppDef) {
                    // Merge the base definition with overrides from the .app file
                    const finalAppDef: AppDefinition = { ...baseAppDef, ...appInfo };
                    dispatch(openApp(finalAppDef));
                    return;
                }
            }
            // Fallback if .app file is invalid
            console.error(`Invalid or unreadable .app file: ${item.path}`);
            return;
        }

        // Default fallback for any other file type
        const notebookDef = appDefinitions.find(def => def.id === 'notebook');
        if (notebookDef) {
            dispatch(openApp({ ...notebookDef, initialData: { filePath: item.path } }));
        }
    }
);
