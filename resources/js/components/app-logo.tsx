import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { eventSettings } = usePage().props as any;
    
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <AppLogoIcon 
                    className="size-5 fill-current text-white dark:text-black" 
                    src={eventSettings.event_logo || '/logo.svg'}
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 text-l truncate leading-tight font-semibold">
                    {eventSettings.event_name || 'Event Ticket'}
                </span>
            </div>
        </>
    );
}
