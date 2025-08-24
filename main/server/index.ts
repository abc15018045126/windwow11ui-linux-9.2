import express, { Request, Response } from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';

const APPS_ROOT = path.join(process.cwd(), 'apps');
const API_PORT = 3001; // As seen in the old codebase

// In-memory store for installed applications
let installedApps: any[] = [];

export function startApiServer() {
  const apiApp = express();
  apiApp.use(cors());
  apiApp.use(express.json());

  // Endpoint to get the list of currently installed (in-memory) apps
  apiApp.get('/api/apps/installed', (_req: Request, res: Response) => {
    res.json(installedApps);
  });

  // Endpoint to "install" an app by adding it to the in-memory list
  apiApp.post('/api/apps/install', (req: Request, res: Response) => {
    const app = req.body;
    if (!app || !app.id) {
      return res.status(400).json({ error: 'Invalid app data provided.' });
    }

    if (installedApps.find(installed => installed.id === app.id)) {
        return res.status(200).json({ message: `App "${app.name}" is already installed.` });
    }

    installedApps.push(app);
    console.log(`[API Server] Installed app: ${app.name}. Current count: ${installedApps.length}`);
    res.status(201).json({ success: true, message: `App "${app.name}" installed.` });
  });

  // Endpoint to discover apps available in the /apps directory
  apiApp.get('/api/apps/available', async (_req: Request, res: Response) => {
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
        res.json(availableApps);
    } catch (error) {
        console.error('[API Server] Error discovering available apps:', error);
        res.status(500).json({ error: 'Failed to discover available apps.' });
    }
  });


  apiApp.listen(API_PORT, () => {
    console.log(`✅ API server listening on http://localhost:${API_PORT}`);
  });

  return apiApp;
}
