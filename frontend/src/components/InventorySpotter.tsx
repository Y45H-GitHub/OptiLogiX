import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import InventoryScanner from './InventoryScanner';
import ProductInfoDisplay from './ProductInfoDisplay';
import WarehouseMap from './WarehouseMap';
import NavigationInstructions from './NavigationInstructions';
import { Product } from './types';

const initialWarehouseGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
initialWarehouseGrid[0][0] = 2; // Set start position



const InventorySpotter = () => {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [warehouseGrid, setWarehouseGrid] = useState(initialWarehouseGrid);

  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [pathSteps, setPathSteps] = useState<{ x: number; y: number }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products'); // Assuming an endpoint to get all products
        if (response.ok) {
          const allProducts: Product[] = await response.json();
          setProducts(allProducts);
          setWarehouseGrid(prevGrid => {

            const newGrid = prevGrid.map(row => row.slice());
            // Product locations are not marked as obstacles; they are assumed to be on traversable shelves.
            // The 'isEnd' logic in WarehouseMap handles displaying the product symbol.
            return newGrid;
          });
        } else {
          console.error('Failed to fetch all products:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching all products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleScanProduct = async (barcode: string) => {
    let barcodeValue = barcode;
    let parsed: {
      scannedData?: {
        itemCode?: { example: string };
        productIdentifier?: { example: string };
        description?: string;
        batchNumber?: { example: string };
        serialNumber?: { example: string };
        dateCodes?: { example: string };
        productType?: { example: string };
        locationCode?: { example: string };
      };
    } | null = null; // Declare parsed outside try block

    if (barcode.startsWith('{')) {
      try {
        parsed = JSON.parse(barcode);
      if (parsed && parsed.scannedData) {
        // Prioritize itemCode, then productIdentifier
        if (parsed.scannedData.itemCode && parsed.scannedData.itemCode.example) {
          barcodeValue = parsed.scannedData.itemCode.example;
        } else if (parsed.scannedData.productIdentifier && parsed.scannedData.productIdentifier.example) {
          barcodeValue = parsed.scannedData.productIdentifier.example;
        }
      }
    } catch (e) {
      // If not JSON, or parsing failed, or expected fields not found, use as-is
      console.log('Barcode is not JSON or expected format, using raw text:', e);
      }
    }

    try {
      const response = await fetch(`http://localhost:3001/api/products/${barcodeValue}`);
      if (response.ok) {
        const product: Product = await response.json();
        const newProduct = { ...product };
        if (parsed && parsed.scannedData) {
          newProduct.description = parsed.scannedData.description || newProduct.description;
          newProduct.productIdentifier = parsed.scannedData.productIdentifier?.example || newProduct.productIdentifier;
          newProduct.batchNumber = parsed.scannedData.batchNumber?.example || newProduct.batchNumber;
          newProduct.serialNumber = parsed.scannedData.serialNumber?.example || newProduct.serialNumber;
          newProduct.dateCodes = parsed.scannedData.dateCodes?.example || newProduct.dateCodes;
          newProduct.productType = parsed.scannedData.productType?.example || newProduct.productType;
          newProduct.locationCode = parsed.scannedData.locationCode?.example || newProduct.locationCode;
        }
        setCurrentProduct(newProduct);
      } else if (response.status === 404) {
        setCurrentProduct(null);
        console.log('Product not found in database.');
      } else {
        console.error('Failed to fetch product:', response.statusText);
        setCurrentProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setCurrentProduct(null);
    }
    setPathSteps([]);
  };

  const findOptimalPath = () => {
    if (!currentProduct || !currentProduct.location) {
      console.warn('Cannot find optimal path: current product or its location is undefined.');
      return;
    }

    const start = { x: currentPosition.x, y: currentPosition.y };
    const end = { x: currentProduct.location.x, y: currentProduct.location.y };
    const grid = warehouseGrid.map(row => row.slice());


     if (grid.length === 0 || grid[0].length === 0) {
      console.warn('Warehouse grid is empty or malformed.');
      return;
    }



    // Heuristic function (Manhattan distance)
    const heuristic = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
      return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    };

    // Priority queue for A* algorithm
    const openList: { x: number; y: number; g: number; h: number; f: number; path: { x: number; y: number }[] }[] = [];
    const closedList = new Set<string>();

    const startNode = { x: start.x, y: start.y, g: 0, h: heuristic(start, end), f: heuristic(start, end), path: [] };
    openList.push(startNode);

    while (openList.length > 0) {
      // Sort openList by f-value to get the node with the lowest f
      openList.sort((a, b) => a.f - b.f);
      const currentNode = openList.shift()!;

      const { x, y, g, path } = currentNode;



      if (x === end.x && y === end.y) {

        setPathSteps(path);
        return;
      }

      const currentNodeKey = `${x},${y}`;
      if (closedList.has(currentNodeKey)) {
        continue;
      }
      closedList.add(currentNodeKey);

      const neighbors = [
        { x: x + 1, y }, // Right
        { x: x - 1, y }, // Left
        { x, y: y + 1 }, // Down
        { x, y: y - 1 }, // Up
      ];

      for (const neighbor of neighbors) {
        if (
          neighbor.x >= 0 &&
           grid.length > 0 && grid[0] && neighbor.x < grid[0].length &&
            neighbor.y >= 0 &&
          neighbor.y < grid.length &&
          (neighbor.x === end.x && neighbor.y === end.y) || // Allow end node to be traversable
          (neighbor.x === start.x && neighbor.y === start.y) || // Allow start node to be traversable
          (grid[neighbor.y] && grid[neighbor.y][neighbor.x] !== 1 &&
          !(neighbor.x % 2 === 0 && neighbor.y % 2 === 0)) // Ensure not a shelf (shelves are obstacles)
        ) {
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (closedList.has(neighborKey)) {
            continue;
          }

          const newG = g + 1; // Cost to move to neighbor is 1
          const newH = heuristic(neighbor, end);
          const newF = newG + newH;

          const existingNodeInOpenList = openList.find(node => node.x === neighbor.x && node.y === neighbor.y);

          if (!existingNodeInOpenList || newG < existingNodeInOpenList.g) {
            if (existingNodeInOpenList) {
              // Update existing node
              existingNodeInOpenList.g = newG;
              existingNodeInOpenList.h = newH;
              existingNodeInOpenList.f = newF;
              existingNodeInOpenList.path = [...path, { x: neighbor.x, y: neighbor.y }];
            } else {
              // Add new node
              openList.push({ x: neighbor.x, y: neighbor.y, g: newG, h: newH, f: newF, path: [...path, { x: neighbor.x, y: neighbor.y }] });
            }
          }
        }
      }
    }


    setPathSteps([]);
  };

  const [collectedItems, setCollectedItems] = useState<{ product: Product; quantity: number }[]>([]); // State to store collected items

  const handleItemCollected = async () => {
    if (!currentProduct) return;

    const quantityStr = prompt(`How many units of ${currentProduct.name} were collected?`);
    const quantity = parseInt(quantityStr || '0', 10);

    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid positive number for quantity.');
      return;
    }

    try {
      const timestamp = new Date().toLocaleString();
      alert(`${quantity} units of ${currentProduct.name} collected successfully at ${timestamp}!`);
      // Update local state for collected items
      setCollectedItems(prev => [{
        product: currentProduct,
        quantity: Number(quantity),
        timestamp: timestamp
      }, ...prev]);
      setCurrentProduct(null); // Clear current product after collection
      setPathSteps([]); // Clear path after collection
    } catch (error) {
      console.error('Error collecting item:', error);
      alert('An error occurred while collecting the item.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="w-7 h-7 text-emerald-600" />
            Inventory Spotter
          </CardTitle>
        </CardHeader>
        <div className="p-6 grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InventoryScanner onScan={handleScanProduct} />
            <ProductInfoDisplay currentProduct={currentProduct} onFindPath={findOptimalPath} />
          </div>
          <NavigationInstructions pathSteps={pathSteps} currentProduct={currentProduct} />
          {pathSteps.length > 0 && currentProduct && (
            <button
              onClick={handleItemCollected}
              className="mt-4 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Item Collected
            </button>
          )}
          <WarehouseMap
            warehouseGrid={warehouseGrid}
            currentPosition={currentPosition}
            pathSteps={pathSteps}
            currentProduct={currentProduct}
          />
        </div>
      </Card>

      {/* Collected Items Section */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-blue-200 shadow-xl mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Recently Collected Items</CardTitle>
        </CardHeader>
        <div className="p-6">
          {collectedItems.length === 0 ? (
            <p className="text-gray-600">No items collected yet.</p>
          ) : (
            <ul className="space-y-2">
              {collectedItems.map((item, index) => (
                <li key={index} className="bg-gray-50 p-3 rounded-md shadow-sm">
                  <p><span className="font-semibold">Product:</span> {item.product.name}</p>
                  <p><span className="font-semibold">Quantity:</span> {item.quantity}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InventorySpotter;
