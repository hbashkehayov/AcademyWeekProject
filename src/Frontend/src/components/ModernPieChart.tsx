'use client';

import { useState, useEffect } from 'react';

interface PieChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface ModernPieChartProps {
  data: PieChartData[];
  title: string;
  size?: number;
  strokeWidth?: number;
}

export default function ModernPieChart({ 
  data, 
  title, 
  size = 200, 
  strokeWidth = 8 
}: ModernPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedData, setAnimatedData] = useState<PieChartData[]>([]);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  // Calculate cumulative percentages for positioning
  const dataWithPositions = animatedData.map((item, index) => {
    const previousTotal = animatedData
      .slice(0, index)
      .reduce((sum, d) => sum + d.percentage, 0);
    
    return {
      ...item,
      startPercentage: previousTotal,
      strokeDasharray: `${(item.percentage / 100) * circumference} ${circumference}`,
      strokeDashoffset: -((previousTotal / 100) * circumference),
      rotation: (previousTotal + item.percentage / 2) * 3.6 - 90, // Convert to degrees
    };
  });

  // Use the colors provided in data, fallback to generated palette
  const colors = data.map(item => item.color);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
      
      {/* Simple, Clean Pie Chart Container */}
      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          {/* Pie Segments with Large Hover Areas */}
          {dataWithPositions.map((item, index) => (
            <g key={item.label}>
              {/* Large Hover Zone - Much Thicker Stroke for Easy Targeting */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="transparent"
                strokeWidth={strokeWidth + 40} // Very thick hover area
                strokeDasharray={item.strokeDasharray}
                strokeDashoffset={item.strokeDashoffset}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              
              {/* Main Visible Arc - Clean and Simple */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors[index]}
                strokeWidth={strokeWidth}
                strokeDasharray={item.strokeDasharray}
                strokeDashoffset={item.strokeDashoffset}
                className="transition-all duration-300 ease-out pointer-events-none"
                style={{
                  opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
                  filter: hoveredIndex === index ? 'brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
                }}
              />
            </g>
          ))}
          
          {/* Clean Background Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={2}
            className="pointer-events-none"
          />
        </svg>
        
        {/* Large Center Content - Fills Gap to Segments */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white/10 backdrop-blur-md rounded-full w-60 h-60 flex items-center justify-center border-2 border-white/20 shadow-lg">
            {hoveredIndex !== null ? (
              <div className="transition-all duration-300 px-4">
                <div className="text-6xl font-bold text-white mb-3 drop-shadow-lg">
                  {dataWithPositions[hoveredIndex]?.value}
                </div>
                <div className="text-xl text-white opacity-90 font-semibold mb-2 leading-tight max-w-48 break-words">
                  {dataWithPositions[hoveredIndex]?.label}
                </div>
                <div className="text-base text-white opacity-70 font-medium">
                  ({dataWithPositions[hoveredIndex]?.percentage.toFixed(1)}%)
                </div>
              </div>
            ) : (
              <div className="transition-all duration-300">
                <div className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {data.reduce((sum, item) => sum + item.value, 0)}
                </div>
                <div className="text-xl text-white opacity-75 font-semibold tracking-wider">
                  TOTAL
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}