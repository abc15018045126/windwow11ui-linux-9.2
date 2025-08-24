import { AppDefinition, AppComponentProps } from '../types';
import NotebookApp, { appDefinition as notebookAppDef } from './Notebook/NotebookApp';
import FileExplorerApp, { appDefinition as fileExplorerAppDef } from './FileExplorer/FileExplorerApp';
import SettingsApp, { appDefinition as settingsAppDef } from './Settings/SettingsApp';
import SFTPApp, { appDefinition as sftpAppDef } from './SFTP/SFTPApp';
import AppStore, { appDefinition as appStoreAppDef } from './AppStore/AppStore';

// A dummy component for external apps that will never be rendered.
const DummyExternalAppComponent: React.FC<AppComponentProps> = () => null;

const appDefinitions: AppDefinition[] = [
  notebookAppDef,
  fileExplorerAppDef,
  settingsAppDef,
  sftpAppDef,
  appStoreAppDef,
];

export const getAppDefinitionById = (id: string): AppDefinition | undefined => {
    return appDefinitions.find(app => app.id === id);
}

// We need to update the component reference in the imported definition
// because the component itself is the default export.
notebookAppDef.component = NotebookApp;
fileExplorerAppDef.component = FileExplorerApp;
settingsAppDef.component = SettingsApp;
sftpAppDef.component = SFTPApp;
appStoreAppDef.component = AppStore;

export default appDefinitions;
