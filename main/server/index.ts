import express, { Request, Response } from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';

const APPS_ROOT = path.join(process.cwd(), 'apps');
const API_PORT = 3001;

// --- Service Object for In-Memory State Management ---
const appService = {
    installedApps: [] as any[],

    getInstalled() {
        return this.installedApps;
    },

    install(app: any) {
        if (!this.installedApps.find(installed => installed.id === app.id)) {
            this.installedApps.push(app);
            console.log(`[AppService] Installed app: ${app.name}. Current count: ${this.installedApps.length}`);
        } else {
            console.log(`[AppService] App "${app.name}" is already installed.`);
        }
        return true;
    },

    async discoverAvailable() {
        try {
            const appFolders = await fs.readdir(APPS_ROOT, { withFileTypes: true });
            const availableApps: any[] = [];
            for (const dirent of appFolders) {
                if (dirent.isDirectory()) {
                    const packageJsonPath = path.join(APPS_ROOT, dirent.name, 'package.json');
                    try {
                        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
                        const packageJson = JSON.parse(packageJsonContent);
                        if (packageJson.name && packageJson.main) {
                            availableApps.push({
                                id: dirent.name,
                                name: packageJson.name,
                                version: packageJson.version,
                                description: packageJson.description,
                                path: path.join('apps', dirent.name),
                            });
                        }
                    } catch (e) { /* Ignore folders without package.json */ }
                }
            }
            return availableApps;
        } catch (error) {
            console.error('[AppService] Error discovering available apps:', error);
            return [];
        }
    }
};

// --- Express API Server ---
export function startApiServer() {
  const apiApp = express();
  apiApp.use(cors());
  apiApp.use(express.json());

  // Endpoint to get the list of currently installed apps
  apiApp.get('/api/apps/installed', (_req: Request, res: Response) => {
    res.json(appService.getInstalled());
  });

  // Endpoint to "install" an app
  apiApp.post('/api/apps/install', (req: Request, res: Response) => {
    const app = req.body;
    if (!app || !app.id) {
      return res.status(400).json({ error: 'Invalid app data provided.' });
    }
    const success = appService.install(app);
    res.status(201).json({ success });
  });

  // Endpoint to discover available apps
  apiApp.get('/api/apps/available', async (_req: Request, res: Response) => {
    const availableApps = await appService.discoverAvailable();
    res.json(availableApps);
  });

  apiApp.listen(API_PORT, () => {
    console.log(`✅ API server listening on http://localhost:${API_PORT}`);
  });

  // Return the service object for direct use in the main process
  return appService;
}
