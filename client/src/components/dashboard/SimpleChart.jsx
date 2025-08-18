/**
 * COMPONENTE DE GRÁFICO SIMPLES
 * Gráfico básico usando CSS para demonstração
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function SimpleChart({ 
  title, 
  data = [], 
  type = 'bar', 
  className = '',
  loading = false 
}) {
  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value || 0));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {data.map((item, index) => {
            const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${item.label}: ${item.value}`}
                ></div>
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legenda com valores */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {data.slice(0, 4).map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600">{item.label}:</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de gráfico de linha simples
export function SimpleLineChart({ 
  title, 
  data = [], 
  className = '',
  loading = false 
}) {
  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value || 0));
  const minValue = Math.min(...data.map(item => item.value || 0));
  const range = maxValue - minValue || 1;

  // Gerar pontos para a linha
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Grade de fundo */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Linha do gráfico */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={points}
              className="drop-shadow-sm"
            />
            
            {/* Pontos */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#3b82f6"
                  className="hover:r-2 transition-all"
                >
                  <title>{`${item.label}: ${item.value}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
        
        {/* Valores min/max */}
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Min: {minValue}</span>
          <span>Max: {maxValue}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de gráfico de pizza simples
export function SimplePieChart({ 
  title, 
  data = [], 
  className = '',
  loading = false 
}) {
  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return {
      ...item,
      percentage: percentage.toFixed(1),
      color: colors[index % colors.length],
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={segment.path}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity"
                >
                  <title>{`${segment.label}: ${segment.value} (${segment.percentage}%)`}</title>
                </path>
              ))}
            </svg>
          </div>
          
          <div className="flex-1 space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="flex-1">{segment.label}</span>
                <span className="font-medium">{segment.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SimpleChart;
