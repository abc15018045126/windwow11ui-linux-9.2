import { useEffect, useState } from 'react';
import { appStore } from '@services/index';
import { AppDefinition, AppComponentProps } from '../../types';

type DiscoveredApp = {
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
};

export const appDefinition: AppDefinition = {
  id: 'app-store',
  name: 'App Store',
  icon: 'store',
  component: () => null, // Placeholder, will be replaced by the default export
};

const AppStore: React.FC<AppComponentProps> = () => {
  const [apps, setApps] = useState<DiscoveredApp[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const discoveredApps = await appStore.discoverApps();
        setApps(discoveredApps);
      } catch (e: any) {
        setError(e.message);
      }
    };

    fetchApps();
  }, []);

  const handleInstall = async (appName: string) => {
    try {
      await appStore.installApp(appName);
      alert(`${appName} installed successfully!`);
      // Maybe refresh the desktop or show a notification
    } catch (e: any) {
      alert(`Error installing ${appName}: ${e.message}`);
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">App Store</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.length > 0 ? (
          apps.map((app) => (
            <div key={app.name} className="border rounded-lg p-4 flex flex-col">
              <div className="flex-grow">
                <h2 className="text-xl font-semibold">{app.name}</h2>
                <p className="text-gray-600">v{app.version}</p>
                <p className="mt-2">{app.description}</p>
                <p className="text-sm text-gray-500 mt-2">By {app.author}</p>
              </div>
              <button
                onClick={() => handleInstall(app.name)}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Install
              </button>
            </div>
          ))
        ) : (
          <p>No apps found in the store.</p>
        )}
      </div>
    </div>
  );
};

export default AppStore;
