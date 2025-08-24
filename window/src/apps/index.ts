import { AppDefinition, AppComponentProps } from '../types';
import NotebookApp, { appDefinition as notebookAppDef } from './Notebook/NotebookApp';
import FileExplorerApp, { appDefinition as fileExplorerAppDef } from './FileExplorer/FileExplorerApp';
import SettingsApp, { appDefinition as settingsAppDef } from './Settings/SettingsApp';
import SFTPApp, { appDefinition as sftpAppDef } from './SFTP/SFTPApp';
import AppStoreApp, { appDefinition as appStoreAppDef } from './AppStore/AppStoreApp';
import { InstalledApp } from '../../../function/stable/app-store/AppStore_v1_main';

// A dummy component for external apps that will never be rendered.
const DummyExternalAppComponent: React.FC<AppComponentProps> = () => null;

const internalAppDefinitions: AppDefinition[] = [
  notebookAppDef,
  fileExplorerAppDef,
  settingsAppDef,
  sftpAppDef,
  appStoreAppDef,
];

// We need to update the component reference in the imported definition
// because the component itself is the default export.
notebookAppDef.component = NotebookApp;
fileExplorerAppDef.component = FileExplorerApp;
settingsAppDef.component = SettingsApp;
sftpAppDef.component = SFTPApp;
appStoreAppDef.component = AppStoreApp;


let allAppsCache: AppDefinition[] | null = null;

export const getAppDefinitions = async (): Promise<AppDefinition[]> => {
    if (allAppsCache) {
        return allAppsCache;
    }

    const installedExternalApps: InstalledApp[] = await window.electronAPI.appStore.getInstalledExternalApps();

    const externalAppDefinitions: AppDefinition[] = installedExternalApps.map((app: InstalledApp) => ({
        ...app,
        isExternal: true,
        component: DummyExternalAppComponent,
    }));

    const allApps = [...internalAppDefinitions, ...externalAppDefinitions];
    allAppsCache = allApps.sort((a, b) => a.name.localeCompare(b.name));

    return allAppsCache;
}

export const getAppDefinitionById = async (id: string): Promise<AppDefinition | undefined> => {
    const apps = await getAppDefinitions();
    return apps.find(app => app.id === id);
}
