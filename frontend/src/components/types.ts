export interface Product {
  barcode: string;
  itemCode: string;
  name: string;
  description?: string; // Added description field
  productIdentifier?: string; // Added productIdentifier field
  batchNumber?: string; // Added batchNumber field
  serialNumber?: string; // Added serialNumber field
  dateCodes?: string; // Added dateCodes field
  productType?: string; // Added productType field
  locationCode?: string; // Added locationCode field
  stock: number;
  location?: { x: number; y: number };
  timestamp?: string; // Added timestamp field for collected items
}