import { promises as fs } from 'fs';
import path from 'path';

const MANIFEST_ROOT = path.join(process.cwd(), 'app-store-manifests');
const VIRTUAL_FS_ROOT = path.join(process.cwd(), 'virtual-fs');

export interface DiscoveredApp {
    name: string;
    icon: string;
    version: string;
    description: string;
    author: string;
    appPath: string; // Relative path to the app's directory
}

/**
 * @description Scans the /app-store-manifests directory for installable application manifests.
 * @returns A list of discoverable applications from their manifests.
 */
export const AppStore_v1_discoverApps = async (): Promise<DiscoveredApp[]> => {
    try {
        const discoveredApps: DiscoveredApp[] = [];
        const manifestFiles = await fs.readdir(MANIFEST_ROOT, { withFileTypes: true });

        for (const dirent of manifestFiles) {
            if (dirent.isFile() && dirent.name.endsWith('.json')) {
                const manifestPath = path.join(MANIFEST_ROOT, dirent.name);
                try {
                    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
                    const manifest = JSON.parse(manifestContent) as DiscoveredApp;

                    // A valid manifest must have a name and a path to the app
                    if (manifest.name && manifest.appPath) {
                        discoveredApps.push(manifest);
                    }
                } catch (e) {
                    console.error(`[AppStore_v1_discoverApps] Error parsing manifest ${dirent.name}:`, e);
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
 * @description "Installs" an app by creating a .app shortcut file on the desktop using its manifest data.
 * @param app The discovered app manifest object.
 * @returns True if successful, false otherwise.
 */
export const AppStore_v1_installApp = async (app: DiscoveredApp): Promise<boolean> => {
    try {
        const shortcutFileName = `${app.name}.app`;
        const shortcutPath = path.join(VIRTUAL_FS_ROOT, 'Desktop', shortcutFileName);

        // Ensure the Desktop directory exists before writing the file
        await fs.mkdir(path.dirname(shortcutPath), { recursive: true });

        // The content of the .app file is a JSON object that points to the real app
        const shortcutContent = {
            appId: app.name, // Use the user-friendly name as the ID
            name: app.name,
            icon: app.icon, // Use the icon from the manifest
            isExternal: true,
            externalPath: app.appPath, // Use the path from the manifest
        };

        await fs.writeFile(shortcutPath, JSON.stringify(shortcutContent, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`[AppStore_v1_installApp] Error installing app ${app.name}:`, error);
        return false;
    }
};
