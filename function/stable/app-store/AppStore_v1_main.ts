// This interface defines the shape of the AppService object passed from main/index.ts
interface AppServiceInterface {
    getInstalled: () => any[];
    install: (app: any) => boolean;
    discoverAvailable: () => Promise<any[]>;
}

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
 * Discovers apps available for installation by calling the AppService.
 */
export const AppStore_v1_discoverAvailableApps = async (appService: AppServiceInterface): Promise<AvailableApp[]> => {
    try {
        const availableApps = await appService.discoverAvailable();
        const installedApps = appService.getInstalled();
        const installedIds = new Set(installedApps.map(app => app.id));

        return availableApps.map(app => ({
            ...app,
            isInstalled: installedIds.has(app.id.toLowerCase()),
        }));

    } catch (error) {
        console.error('[discoverAvailableApps] Error:', error);
        return [];
    }
};

/**
 * Installs an app by calling the AppService.
 */
export const AppStore_v1_installExternalApp = async (appService: AppServiceInterface, app: AvailableApp): Promise<boolean> => {
    try {
        const componentName = app.id.charAt(0).toUpperCase() + app.id.slice(1);
        const payload = {
            id: app.id.toLowerCase(),
            name: componentName,
            icon: app.id.toLowerCase(),
            isExternal: true,
            externalPath: `${app.path}/main.js`,
        };

        return appService.install(payload);
    } catch (error) {
        console.error(`[installExternalApp] Error:`, error);
        return false;
    }
};

/**
 * Retrieves the list of all installed external applications from the AppService.
 */
export const AppStore_v1_getInstalledExternalApps = async (appService: AppServiceInterface): Promise<InstalledApp[]> => {
    try {
        return appService.getInstalled();
    } catch (error) {
        console.error('[getInstalledExternalApps] Error:', error);
        return [];
    }
};
