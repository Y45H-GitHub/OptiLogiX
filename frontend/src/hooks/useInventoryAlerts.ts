import { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export interface InventoryAlert {
    sku: string;
    item: string;
    level: string;
    stock: number;
    threshold: number;
}

const initialInventoryAlerts: InventoryAlert[] = [
    { sku: 'ELEC-001', item: 'Laptop Batteries', level: 'Critical', stock: 12, threshold: 50 },
    { sku: 'FURN-045', item: 'Office Chairs', level: 'Low', stock: 23, threshold: 30 },
    { sku: 'TOOLS-089', item: 'Power Drills', level: 'Reorder', stock: 45, threshold: 100 }
];

export const useInventoryAlerts = () => {
    const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>(initialInventoryAlerts);
    const { notifications } = useNotifications();

    // Monitor notifications for processed inventory alerts
    useEffect(() => {
        // Find notifications that were created from dashboard system and are now processed
        const processedSkus = notifications
            .filter(n =>
                n.orderDetails.requestedBy === 'Dashboard System' &&
                (n.type === 'approved' || n.type === 'rejected')
            )
            .map(n => n.orderDetails.sku);

        // Remove processed alerts from inventory alerts
        if (processedSkus.length > 0) {
            setInventoryAlerts(prev =>
                prev.filter(alert => !processedSkus.includes(alert.sku))
            );
        }
    }, [notifications]);

    const resetInventoryAlerts = () => {
        setInventoryAlerts(initialInventoryAlerts);
    };

    return {
        inventoryAlerts,
        resetInventoryAlerts
    };
};