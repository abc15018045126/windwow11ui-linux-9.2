import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api/apps';

export interface AvailableApp {
    id: string;
    name: string;
    version: string;
    description: string;
    path: string;
    isInstalled?: boolean;
}

export interface InstalledApp {
    id: string;
    name: string;
    icon: string;
    isExternal: true;
    externalPath: string;
}

/**
 * Discovers apps available for installation by fetching from the backend server.
 */
export const AppStore_v1_discoverAvailableApps = async (): Promise<AvailableApp[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/available`);
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        const apps = await response.json() as AvailableApp[];

        // Check installation status
        const installedApps = await AppStore_v1_getInstalledExternalApps();
        const installedIds = new Set(installedApps.map(app => app.id));

        return apps.map(app => ({
            ...app,
            isInstalled: installedIds.has(app.id),
        }));

    } catch (error) {
        console.error('[discoverAvailableApps] Error fetching from server:', error);
        return [];
    }
};

/**
 * Installs an app by posting to the backend server.
 */
export const AppStore_v1_installExternalApp = async (app: AvailableApp): Promise<boolean> => {
    try {
        const componentName = app.id.charAt(0).toUpperCase() + app.id.slice(1);
        const payload = {
            id: app.id.toLowerCase(),
            name: componentName,
            icon: app.id.toLowerCase(),
            isExternal: true,
            externalPath: `${app.path}/main.js`,
        };

        const response = await fetch(`${API_BASE_URL}/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        return response.ok;
    } catch (error) {
        console.error(`[installExternalApp] Error fetching from server:`, error);
        return false;
    }
};

/**
 * Retrieves the list of all installed external applications from the server.
 */
export const AppStore_v1_getInstalledExternalApps = async (): Promise<InstalledApp[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/installed`);
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        return await response.json() as InstalledApp[];
    } catch (error) {
        console.error('[getInstalledExternalApps] Error fetching from server:', error);
        return [];
    }
};
