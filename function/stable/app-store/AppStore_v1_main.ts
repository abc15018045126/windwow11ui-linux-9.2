import { promises as fs } from 'fs';
import path from 'path';

const APPS_ROOT = path.join(process.cwd(), 'apps');
const REGISTRY_PATH = path.join(process.cwd(), 'data', 'external-apps.json');

/**
 * Describes an application that is available on the filesystem for installation.
 */
export interface AvailableApp {
    id: string;
    name: string;
    version: string;
    description: string;
    path: string; // The path to the app's directory, e.g., "apps/Chrome5"
}

/**
 * Describes an application that has been "installed" and is in the registry.
 */
export interface InstalledApp {
    id: string;
    name: string;
    icon: string;
    isExternal: true;
    externalPath: string; // The path to the app's executable main script
}

/**
 * Scans the filesystem for apps that are available to be installed.
 */
export const AppStore_v1_discoverAvailableApps = async (): Promise<AvailableApp[]> => {
    try {
        const appFolders = await fs.readdir(APPS_ROOT, { withFileTypes: true });
        const availableApps: AvailableApp[] = [];

        for (const dirent of appFolders) {
            if (dirent.isDirectory()) {
                const packageJsonPath = path.join(APPS_ROOT, dirent.name, 'package.json');
                try {
                    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
                    const packageJson = JSON.parse(packageJsonContent);

                    if (packageJson.name && packageJson.main) {
                        availableApps.push({
                            id: dirent.name.toLowerCase(), // e.g., "chrome5"
                            name: packageJson.name, // e.g., "remote-electron-browser"
                            version: packageJson.version,
                            description: packageJson.description,
                            path: path.join('apps', dirent.name),
                        });
                    }
                } catch (e) {
                    // Ignore folders without a valid package.json
                }
            }
        }
        return availableApps;
    } catch (error) {
        console.error('[discoverAvailableApps] Error:', error);
        return [];
    }
};

/**
 * "Installs" an app by adding its definition to the external apps registry.
 */
export const AppStore_v1_installExternalApp = async (app: AvailableApp): Promise<boolean> => {
    try {
        let registry: InstalledApp[] = [];
        try {
            const data = await fs.readFile(REGISTRY_PATH, 'utf-8');
            registry = JSON.parse(data);
        } catch (error: any) {
            if (error.code !== 'ENOENT') throw error;
        }

        if (registry.some(installedApp => installedApp.id === app.id)) {
            console.log(`App "${app.name}" is already installed.`);
            return true; // Already installed, consider it a success
        }

        const newAppEntry: InstalledApp = {
            id: app.id,
            name: app.name, // In a real system, you'd let the user customize this
            icon: app.id, // Default to using the app ID for the icon
            isExternal: true,
            externalPath: path.join(app.path, 'main.js'), // Convention from old system
        };

        registry.push(newAppEntry);
        await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2));
        return true;
    } catch (error) {
        console.error(`[installExternalApp] Error for app ${app.name}:`, error);
        return false;
    }
};

/**
 * Retrieves the list of all installed external applications from the registry.
 */
export const AppStore_v1_getInstalledExternalApps = async (): Promise<InstalledApp[]> => {
    try {
        const data = await fs.readFile(REGISTRY_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return []; // If registry doesn't exist, no apps are installed
        }
        console.error('[getInstalledExternalApps] Error:', error);
        return [];
    }
};
