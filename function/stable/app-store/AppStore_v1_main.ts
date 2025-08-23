import { promises as fs } from 'fs';
import path from 'path';

const APPS_ROOT = path.join(process.cwd(), 'apps');

export interface DiscoveredApp {
    name: string;
    path: string; // Relative path to the app's directory
    description?: string;
    version?: string;
}

/**
 * @description Scans the /apps directory for valid installable applications.
 * @returns A list of discoverable applications.
 */
const VIRTUAL_FS_ROOT = path.join(process.cwd(), 'virtual-fs');

export const AppStore_v1_discoverApps = async (): Promise<DiscoveredApp[]> => {
    try {
        const discoveredApps: DiscoveredApp[] = [];
        const appFolders = await fs.readdir(APPS_ROOT, { withFileTypes: true });

        for (const dirent of appFolders) {
            if (dirent.isDirectory()) {
                const appPath = dirent.name;
                const packageJsonPath = path.join(APPS_ROOT, appPath, 'package.json');
                try {
                    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
                    const packageJson = JSON.parse(packageJsonContent);

                    // A valid app must have a name and a main entry point
                    if (packageJson.name && packageJson.main) {
                        discoveredApps.push({
                            name: packageJson.name,
                            path: `apps/${appPath}`,
                            description: packageJson.description,
                            version: packageJson.version,
                        });
                    }
                } catch (e) {
                    // Ignore folders that don't have a valid package.json
                }
            }
        }
        return discoveredApps;
    } catch (error) {
        console.error(`[AppStore_v1_discoverApps] Error discovering apps:`, error);
        return []; // Return empty array on error
    }
};

/**
 * @description "Installs" an app by creating a .app shortcut file on the desktop.
 * @param app The discovered app object.
 * @returns True if successful, false otherwise.
 */
export const AppStore_v1_installApp = async (app: DiscoveredApp): Promise<boolean> => {
    try {
        const shortcutFileName = `${app.name}.app`;
        const shortcutPath = path.join(VIRTUAL_FS_ROOT, 'Desktop', shortcutFileName);

        // The content of the .app file is a JSON object that points to the real app
        const shortcutContent = {
            appId: app.name, // This assumes the app's 'name' in its package.json is its unique ID
            name: app.name,
            icon: 'chrome', // Placeholder icon for now
            isExternal: true,
            externalPath: app.path,
        };

        await fs.writeFile(shortcutPath, JSON.stringify(shortcutContent, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`[AppStore_v1_installApp] Error installing app ${app.name}:`, error);
        return false;
    }
};
