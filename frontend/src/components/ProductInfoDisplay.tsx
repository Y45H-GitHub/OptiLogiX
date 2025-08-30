import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Navigation } from 'lucide-react';
import { Product } from './types';

interface ProductInfoDisplayProps {
  currentProduct: Product | null;
  onFindPath: () => void;
}

const ProductInfoDisplay: React.FC<ProductInfoDisplayProps> = ({ currentProduct, onFindPath }) => {
  return (
    <>
      {/* ✅ Show raw scan result above card */}
      {currentProduct && (
        <div className="text-center text-md font-medium text-teal-700 mb-2">
          <span className="bg-teal-100 px-4 py-1 rounded-full border border-teal-300">
            Scanned Barcode: <strong>{currentProduct.barcode}</strong>
          </span>
        </div>
      )}

      <Card className="bg-white/90 backdrop-blur-md border-2 border-cyan-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-600" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentProduct ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentProduct.name}</h3>
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm">
                  {currentProduct.barcode}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
                  <div className="text-center">
                    <Package className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-700">{currentProduct.stock}</div>
                    <div className="text-sm text-emerald-600">In Stock</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-blue-700">
                      {currentProduct.location ? `(${currentProduct.location.x}, ${currentProduct.location.y})` : 'N/A'}
                    </div>
                    <div className="text-sm text-blue-600">Location</div>
                  </div>
                </div>
              </div>

              {currentProduct.description && (
                <div className="text-gray-700 text-center">
                  <span className="font-semibold">Description:</span> {currentProduct.description}
                </div>
              )}
              {currentProduct.productIdentifier && (
                <div className="text-gray-700 text-center">
                  <span className="font-semibold">Product Identifier:</span> {currentProduct.productIdentifier}
                </div>
              )}
              {currentProduct.batchNumber && (
                <div className="text-gray-700 text-center">
                  <span className="font-semibold">Batch Number:</span> {currentProduct.batchNumber}
                </div>
              )}
              {currentProduct.serialNumber && (
                <div className="text-gray-700 text-center">
                  <span className="font-semibold">Serial Number:</span> {currentProduct.serialNumber}
                </div>
              )}
              {currentProduct.dateCodes && (
                <div className="text-gray-700 text-center">
                  <span className="font-semibold">Date Codes:</span> {currentProduct.dateCodes}
                </div>
              )}
              {currentProduct.productType && (
                <div className="text-gray-700 text-center">
                  <span className="font-semibold">Product Type:</span> {currentProduct.productType}
                </div>
              )}
              {currentProduct.locationCode && (
                <div className="text-gray-700 text-center">
                  <span className="font-semibold">Location Code:</span> {currentProduct.locationCode}
                </div>
              )}

              {currentProduct.location && (
                <Button
                  onClick={onFindPath}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Find Optimal Path
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Scan a barcode to view product information</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ProductInfoDisplay;
