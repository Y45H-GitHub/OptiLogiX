import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationBellProps {
    onClick: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
    const { unreadCount } = useNotifications();

    return (
        <div className="relative cursor-pointer" onClick={onClick}>
            <div className="flex items-center space-x-2">
                <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
                <span className="text-gray-800 font-medium">Notifications</span>
            </div>

            {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;