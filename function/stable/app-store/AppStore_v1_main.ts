import { promises as fs, existsSync } from 'fs';
import path from 'path';

const APPS_ROOT = path.join(process.cwd(), 'apps');
const AUTOGEN_APP_ROOT = path.join(process.cwd(), 'window', 'src', 'apps');

/**
 * Describes an application that is available on the filesystem for installation.
 */
export interface AvailableApp {
    id: string; // The directory name, e.g., "Chrome5"
    name: string; // The name from package.json, e.g., "remote-electron-browser"
    version: string;
    description: string;
    path: string; // The relative path to the app's directory, e.g., "apps/Chrome5"
}

const generateLauncherComponent = (appName: string, appDef: object): string => {
    const componentName = appName.charAt(0).toUpperCase() + appName.slice(1) + 'App';
    const appDefString = JSON.stringify(appDef, null, 2);

    return `// This is an auto-generated file for the ${appName} application.
// Do not edit manually.
import React from 'react';
import { AppDefinition, AppComponentProps } from '../../types';

const LauncherComponent: React.FC<AppComponentProps> = () => {
  // This component is a placeholder for an external application.
  // It will not be rendered directly. The 'isExternal' flag handles the launch.
  return null;
};

export const appDefinition: AppDefinition = ${appDefString};

export default LauncherComponent;
`;
};

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
                            id: dirent.name, // e.g., "Chrome5"
                            name: packageJson.name,
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
 * Installs an app by generating a .tsx launcher file for it.
 */
export const AppStore_v1_installExternalApp = async (app: AvailableApp): Promise<boolean> => {
    try {
        const componentName = app.id.charAt(0).toUpperCase() + app.id.slice(1); // "Chrome5"
        const launcherFilePath = path.join(AUTOGEN_APP_ROOT, `${componentName}App.tsx`);

        if (existsSync(launcherFilePath)) {
            console.warn(`App "${app.name}" is already installed. Launcher file exists.`);
            return true; // Consider it a success if already installed
        }

        const appDefinition = {
            id: app.id.toLowerCase(), // e.g., "chrome5"
            name: componentName, // Use the sanitized name like "Chrome5" for display
            icon: app.id.toLowerCase(), // Use the id for the icon name
            isExternal: true,
            externalPath: path.join(app.path, 'main.js'),
            component: null, // This will be replaced by the default export in the file
        };

        const launcherContent = generateLauncherComponent(componentName, appDefinition);
        await fs.writeFile(launcherFilePath, launcherContent, 'utf-8');

        console.log(`Successfully generated launcher for ${app.name} at ${launcherFilePath}`);
        return true;
    } catch (error) {
        console.error(`[installExternalApp] Error for app ${app.name}:`, error);
        return false;
    }
};
