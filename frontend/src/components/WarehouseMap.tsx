import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';
import { Product } from './types';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface WarehouseMapProps {
  warehouseGrid: number[][];
  currentPosition: { x: number; y: number };
  currentProduct: Product | null;
  pathSteps: { x: number; y: number }[];
}

const Cell = React.memo(({
  position,
  color,
  type,
  onClick
}: {
  position: [number, number, number];
  color: string;
  type?: string;
  onClick?: (event: THREE.Event) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isShelf = type === 'shelf';
  const isObstacle = type === 'obstacle';
  const isPath = type === 'path';
  const isStart = type === 'start';
  const isEnd = type === 'end';

  let cellColor = color;
  let geometryArgs: [number, number, number] = [0.9, 0.9, 0.9];

  if (isShelf) {
    cellColor = '#8B4513'; // SaddleBrown (lighter brown) for shelves
    geometryArgs = [0.9, 0.9, 2.0]; // Even taller for shelves
  } else if (isObstacle) {
    cellColor = '#4F4F4F'; // Darker Gray for obstacles
  } else if (isPath) {
    cellColor = '#F0FFFF'; // Azure (much lighter) for path
  } else if (isStart) {
    cellColor = '#32CD32'; // LimeGreen for start
  } else if (isEnd) {
    cellColor = '#FF4500'; // OrangeRed for end
  } else {
    cellColor = '#D3D3D3'; // LightGray for empty floor
  }

  return (
    <mesh ref={meshRef} position={position} onClick={onClick}>
      <boxGeometry args={geometryArgs} />
      <meshStandardMaterial color={cellColor} />
      {type && (
        <Text
          position={isObstacle || isStart || isEnd ? [0, 0, 0.5] : [0, 0, 1.1]} 
          fontSize={0.8}
            color={'white'}
          anchorX="center"
          anchorY="middle"
        >
          {type === 'start' ? '🚶' : type === 'end' ? '📦' : type === 'path' ? '→' : ''}
          {isShelf && '📚'}
          {isObstacle && '🚧'}
        </Text>
      )}
    </mesh>
  );


});

const WarehouseMap: React.FC<WarehouseMapProps> = ({
  warehouseGrid,
  currentPosition,
  currentProduct,
  pathSteps,
}) => {
  const gridSize = 8;
  const cellSize = 1;

  return (
    <Card className="bg-white/90 backdrop-blur-md border-2 border-blue-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Map className="w-6 h-6 text-blue-600" />
          Warehouse Navigation Map (3D)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200" style={{ height: '500px' }}>
          <Canvas camera={{ position: [gridSize / 2, gridSize * 1.5, gridSize * 2], fov: 50, rotation: [-Math.PI / 4, 0, 0] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

            {warehouseGrid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isPath = pathSteps.some(step => step.x === colIndex && step.y === rowIndex);
                const isStart = currentPosition.x === colIndex && currentPosition.y === rowIndex;
                const isEnd = currentProduct && currentProduct.location.x === colIndex && currentProduct.location.y === rowIndex;

                let cellType: string = 'empty';
                let cellColor: string = 'white';

                if (cell === 1) {
                  cellType = 'obstacle';
                  cellColor = 'gray';
                } else if (isStart) {
                  cellType = 'start';
                  cellColor = 'green';
                } else if (isEnd) {
                  cellType = 'end';
                  cellColor = 'red';
                } else if (isPath) {
                  cellType = 'path';
                  cellColor = 'blue';
                } else if (colIndex % 2 === 0 && rowIndex % 2 === 0) { // Example: place shelves in a pattern
                  cellType = 'shelf';
                  cellColor = '#8B4513'; // SaddleBrown
                }

                // Ensure path and start/end override shelf/obstacle
                if (isStart) { cellType = 'start'; cellColor = 'green'; }
                else if (isEnd) { cellType = 'end'; cellColor = 'red'; }
                else if (isPath) { cellType = 'path'; cellColor = 'blue'; }

                return (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    position={[
                      colIndex * cellSize - (gridSize * cellSize) / 2 + cellSize / 2,
                      (gridSize * cellSize) / 2 - rowIndex * cellSize - cellSize / 2,
                      0,
                    ]}
                    type={cellType}
                    color={cellColor}
                  />
                );
              })
            )}
          </Canvas>
          <div className="flex justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
                <span className="text-gray-700">Start Position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
                <span className="text-gray-700">Target Item</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-600"></div>
                <span className="text-gray-700">Optimal Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded border-2 border-gray-600"></div>
                <span className="text-gray-700">Obstacle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#8B4513] rounded border-2 border-[#6B350F]"></div>
                <span className="text-gray-700">Shelf</span>
              </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseMap;