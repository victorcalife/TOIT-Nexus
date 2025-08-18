/**
 * COMPONENTE DE CARD DE MÉTRICA
 * Widget reutilizável para exibir métricas do dashboard
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  badge, 
  className = '',
  loading = false,
  formatter = (val) => val
}) {
  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatter(value)}
        </div>
        
        {(trend !== undefined || trendLabel || badge) && (
          <div className="flex items-center justify-between mt-2">
            {(trend !== undefined || trendLabel) && (
              <p className="text-xs text-muted-foreground flex items-center">
                {trend !== undefined && (
                  <>
                    {trend >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    {trend >= 0 ? '+' : ''}{trend}%
                  </>
                )}
                {trendLabel && (
                  <span className={trend !== undefined ? 'ml-1' : ''}>
                    {trendLabel}
                  </span>
                )}
              </p>
            )}
            
            {badge && (
              <Badge 
                variant={badge.variant || 'default'}
                className="text-xs"
              >
                {badge.text}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricCard;
