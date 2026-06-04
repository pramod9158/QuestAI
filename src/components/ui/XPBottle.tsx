import React from 'react';

interface XPBottleProps {
  percent: number;
  size?: number;
  className?: string;
}

export function XPBottle({ percent, size = 64, className = '' }: XPBottleProps) {
  // Fluid consists of 8 rows of pixels from y=5 (top) to y=12 (bottom)
  // We determine how many rows are filled based on the completion percentage.
  const filledRows = Math.round((Math.max(0, Math.min(100, percent)) / 100) * 8);

  // The 8 fluid rows, ordered from top (y=5) to bottom (y=12)
  // bottom-up rank is 8 for y=5, and 1 for y=12
  const fluidRows = [
    { y: 5, xs: [6, 7, 8, 9], rank: 8 },
    { y: 6, xs: [5, 6, 7, 8, 9, 10], rank: 7 },
    { y: 7, xs: [4, 5, 6, 7, 8, 9, 10, 11], rank: 6 },
    { y: 8, xs: [4, 5, 6, 7, 8, 9, 10, 11], rank: 5 },
    { y: 9, xs: [4, 5, 6, 7, 8, 9, 10, 11], rank: 4 },
    { y: 10, xs: [4, 5, 6, 7, 8, 9, 10, 11], rank: 3 },
    { y: 11, xs: [4, 5, 6, 7, 8, 9, 10, 11], rank: 2 },
    { y: 12, xs: [5, 6, 7, 8, 9, 10], rank: 1 }
  ];

  // Define color themes for fluid shading
  const getFluidColor = (x: number, y: number, isEdgeLeft: boolean, isEdgeRight: boolean) => {
    // Top surface of the fluid has a lighter foam/highlight color
    const isTopSurface = y === (13 - filledRows);

    if (isTopSurface) {
      if (x === 6 || x === 7) return '#ffffff'; // white foam highlight
      return '#8affff'; // light foam
    }

    if (isEdgeLeft) {
      return '#5cf5ff'; // left highlight
    }
    if (isEdgeRight || y === 12) {
      return '#009bb3'; // bottom/right shadow
    }
    
    // Default fluid body
    return '#00d8f0'; // vibrant aqua-teal
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={`mc-potion-bottle ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 1. Stopper / Cork (Brown) */}
      <rect x="7" y="0" width="2" height="1" fill="#815631" />
      <rect x="7" y="1" width="2" height="1" fill="#58371c" />

      {/* 2. Glass Rim (Light Grey) */}
      <rect x="6" y="2" width="4" height="1" fill="#dbdbdb" />

      {/* 3. Neck Outline */}
      <rect x="6" y="3" width="1" height="2" fill="#9b9b9b" />
      <rect x="9" y="3" width="1" height="2" fill="#9b9b9b" />

      {/* 4. Inside neck content (Empty glass color or full potion liquid if percent is high) */}
      {filledRows >= 8 ? (
        <rect x="7" y="3" width="2" height="2" fill="#8affff" />
      ) : (
        <rect x="7" y="3" width="2" height="2" fill="#1b173a" fillOpacity="0.4" />
      )}

      {/* 5. Main Fluid Filling */}
      {fluidRows.map((row) => {
        const isFilled = row.rank <= filledRows;
        return row.xs.map((x) => {
          const isEdgeLeft = x === row.xs[0];
          const isEdgeRight = x === row.xs[row.xs.length - 1];

          if (isFilled) {
            return (
              <rect
                key={`fluid-${x}-${row.y}`}
                x={x}
                y={row.y}
                width="1"
                height="1"
                fill={getFluidColor(x, row.y, isEdgeLeft, isEdgeRight)}
              />
            );
          } else {
            // Draw empty bottle background grid (air inside glass)
            return (
              <rect
                key={`empty-${x}-${row.y}`}
                x={x}
                y={row.y}
                width="1"
                height="1"
                fill="#120e28"
                fillOpacity="0.5"
              />
            );
          }
        });
      })}

      {/* 6. Glass Bottle Outline */}
      {/* Shoulders */}
      <rect x="5" y="5" width="1" height="1" fill="#9b9b9b" />
      <rect x="10" y="5" width="1" height="1" fill="#696969" />
      <rect x="4" y="6" width="1" height="1" fill="#9b9b9b" />
      <rect x="11" y="6" width="1" height="1" fill="#696969" />

      {/* Sides */}
      <rect x="3" y="7" width="1" height="5" fill="#dbdbdb" />
      <rect x="12" y="7" width="1" height="5" fill="#4d4d4d" />

      {/* Bottom Corners */}
      <rect x="4" y="12" width="1" height="1" fill="#9b9b9b" />
      <rect x="11" y="12" width="1" height="1" fill="#4d4d4d" />

      {/* Bottom Wall */}
      <rect x="5" y="13" width="6" height="1" fill="#696969" />

      {/* 7. Glass Highlight Reflections (drawn over everything to give a shiny look) */}
      <rect x="4" y="7" width="1" height="3" fill="#ffffff" fillOpacity="0.4" />
      <rect x="5" y="6" width="1" height="1" fill="#ffffff" fillOpacity="0.4" />
      <rect x="8" y="11" width="2" height="1" fill="#ffffff" fillOpacity="0.15" />
    </svg>
  );
}
