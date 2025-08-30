import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface InventoryScannerProps {
  onScan: (barcode: string) => void;
}

const InventoryScanner: React.FC<InventoryScannerProps> = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  return (
    <Card className="bg-white/90 backdrop-blur-md border-2 border-teal-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Barcode Scanner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl overflow-hidden border-2 border-teal-300 p-4">
          {!isScanning ? (
            <button
              onClick={() => setIsScanning(true)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
            >
              Start Scan
            </button>
          ) : (
            <>
              <div className="w-full mb-4">
                <Scanner
                  onScan={(result) => {
                    if (result && result[0]) {
                      const scannedText = result[0].rawValue;
                      console.log('Scanned QR Code:', scannedText);

                      let barcodeToPass = scannedText;
                      try {
                        const parsedData = JSON.parse(scannedText);
                        if (parsedData && parsedData.scannedData) {
                          // Prioritize itemCode, then productIdentifier
                          if (parsedData.scannedData.itemCode && parsedData.scannedData.itemCode.example) {
                            barcodeToPass = parsedData.scannedData.itemCode.example;
                          } else if (parsedData.scannedData.productIdentifier && parsedData.scannedData.productIdentifier.example) {
                            barcodeToPass = parsedData.scannedData.productIdentifier.example;
                          }
                        }
                      } catch (e) {
                        // Not a JSON string, or parsing failed, use raw text
                        console.log('Scanned data is not JSON or expected format, using raw text.');
                      }

                      onScan(barcodeToPass);
                      setIsScanning(false); // Stop scanning after a successful scan
                    }
                  }}
                  onError={(error) => {
                    console.error(error);
                  }}
                  constraints={{ facingMode: 'environment' }}
                />
              </div>
              <button
                onClick={() => setIsScanning(false)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
              >
                Stop Scan
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryScanner;
