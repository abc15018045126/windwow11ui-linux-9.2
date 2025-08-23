import React from 'react';
import { AppIconProps } from '../types';

// This file is ported from the old codebase to provide the necessary SVG icon components.

export const StartIcon: React.FC<AppIconProps> = ({ className = 'w-6 h-6', isSmall }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={isSmall ? 'w-5 h-5' : className}><path d="M5.586 3.414A2 2 0 017 2h10a2 2 0 012 2v10a2 2 0 01-1.414 1.914l-1 .086H16a1 1 0 00-1 1v1.5H9.5V17a1 1 0 00-1-1H7l-1-.086A2 2 0 015 14V4a2 2 0 01.586-.586zM17 19.5a1 1 0 11-2 0 1 1 0 012 0zM7 19.5a1 1 0 11-2 0 1 1 0 012 0zM12 7.5a1 1 0 11-2 0 1 1 0 012 0zM12 11.5a1 1 0 11-2 0 1 1 0 012 0zM16 7.5a1 1 0 11-2 0 1 1 0 012 0zM16 11.5a1 1 0 11-2 0 1 1 0 012 0zM8 7.5a1 1 0 11-2 0 1 1 0 012 0zM8 11.5a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
);
export const SearchIcon: React.FC<AppIconProps> = ({ className = 'w-6 h-6', isSmall }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={isSmall ? 'w-5 h-5' : className}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
);
export const SettingsIcon: React.FC<AppIconProps> = ({ className = 'w-6 h-6', isSmall }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={isSmall ? 'w-5 h-5' : className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 0 1 0 1.844c.008.379.137.753.43.992l1.004.827a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.354-.133-.75-.072-1.075.124a6.607 6.607 0 0 1-.22.128c-.333.183-.582.495-.646.87l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.646-.87a6.607 6.607 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.844c-.008-.379-.137-.753-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.354.133.75.072 1.075-.124a6.607 6.607 0 0 1 .22-.128c.333-.183.582.495.646.87l.213-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
);
export const NotebookIcon: React.FC<AppIconProps> = ({ className = 'w-6 h-6', isSmall }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={isSmall ? 'w-5 h-5' : className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
);
export const CloseIcon: React.FC<AppIconProps> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);
export const MinimizeIcon: React.FC<AppIconProps> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
);
export const MaximizeIcon: React.FC<AppIconProps> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
);
export const RestoreIcon: React.FC<AppIconProps> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
);
export const FileGenericIcon: React.FC<AppIconProps> = ({ className = 'w-12 h-12', isSmall }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={isSmall ? 'w-5 h-5' : className}><path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a2.25 2.25 0 000 3.182l10.94 10.94a2.25 2.25 0 003.182-3.182L9.621 16.25a.75.75 0 01-1.06-1.061l8.368-8.368a2.25 2.25 0 00-3.182-3.182L4.08 13.28a.75.75 0 01-1.06-1.06l9.72-9.72a2.25 2.25 0 000-3.182z" clipRule="evenodd" /><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 009 3H5.625z" /></svg>
);
export const FolderIcon: React.FC<AppIconProps> = ({ className = 'w-12 h-12', isSmall }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={isSmall ? 'w-5 h-5' : className}><path fillRule="evenodd" d="M19.5 21a3 3 0 003-3V9a3 3 0 00-3-3h-5.25a3 3 0 01-2.65-1.5L9.9 3.45A3 3 0 007.25 2H4.5a3 3 0 00-3 3v13.5a3 3 0 003 3h15z" clipRule="evenodd" /></svg>
);
export const UserIcon: React.FC<AppIconProps> = ({ className = 'w-6 h-6', isSmall }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={isSmall ? 'w-5 h-5' : className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
);
export const FileExplorerIcon: React.FC<AppIconProps> = ({ className = 'w-6 h-6', isSmall, }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={isSmall ? 'w-5 h-5' : className}><path d="M19.5 21a3 3 0 003-3V9a3 3 0 00-3-3h-5.25a3 3 0 01-2.65-1.5L9.9 3.45A3 3 0 007.25 2H4.5a3 3 0 00-3 3v13.5a3 3 0 003 3h15z" /></svg>
);
export const SftpIcon: React.FC<AppIconProps> = ({ className = 'w-6 h-6', isSmall, }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={isSmall ? 'w-5 h-5' : className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
);
export const BrowserIcon: React.FC<AppIconProps> = ({ className = 'w-6 h-6', isSmall, }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={isSmall ? 'w-5 h-5' : className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.358 0 2.662-.33 3.797-.938M12 21c-1.358 0-2.662-.33-3.797-.938m0 0a9.004 9.004 0 01-4.28-4.28m0 0a9.004 9.004 0 014.28-4.28m0 0a8.957 8.957 0 018.598 0m0 0a9.004 9.004 0 014.28 4.28m0 0a9.004 9.004 0 01-4.28 4.28M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
);
export const TASKBAR_HEIGHT = 48;
