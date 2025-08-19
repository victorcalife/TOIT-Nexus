/**
 * QUANTUM CONTROL PANEL - TOIT NEXUS ENTERPRISE
 * 
 * Interface de controle comercial e gerenciamento do Quantum ML Engine
 * Permite controle granular de ativação/desativação e gestão de créditos
 * 
 * @version 3.0.0 - Commercial Quantum Control
 * @author TOIT Enterprise - Quantum Business Division
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Zap, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Gauge, 
  DollarSign,
  BarChart3,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Package,
  Crown,
  Atom
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface QuantumTier {
  name: string;
  description: string;
  price: { monthly: number; annual: number };
  features: {
    qubits: number;
    parallel_universes: number;
    monthly_credits: number;
    operations_per_day: number;
    concurrent_operations: number;
    background_processing: boolean;
    real_time_analytics: boolean;
    quantum_consulting: boolean;
    sla: string;
  };
  available_operations: string[];
  ideal_for: string;
  quantum_advantage: string;
}

interface CreditUsage {
  current_balance: number;
  monthly_limit: number;
  used_this_month: number;
  usage_percentage: number;
  estimated_monthly_cost: number;
  usage_trend: string;
  top_operations: Array<{
    operation: string;
    count: number;
    credits: number;
  }>;
  recommendations: string[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QuantumControlPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [configChanges, setConfigChanges] = useState<Record<string, boolean>>({});

  // ========================================================================
  // API QUERIES
  // ========================================================================

  // Fetch available quantum tiers
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['quantum-tiers'],
    queryFn: async () => {
      const response = await fetch('/api/quantum-commercial/tiers', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch quantum tiers');
      return response.json();
    }
  });

  // Fetch current credit usage
  const { data: creditUsage, isLoading: creditLoading } = useQuery({
    queryKey: ['quantum-credits'],
    queryFn: async () => {
      const response = await fetch('/api/quantum-commercial/credits', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch credit usage');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch ROI analytics
  const { data: roiData, isLoading: roiLoading } = useQuery({
    queryKey: ['quantum-roi', activeTab],
    queryFn: async () => {
      const response = await fetch('/api/quantum-commercial/analytics/roi', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ROI data');
      return response.json();
    },
    enabled: activeTab === 'analytics'
  });

  // ========================================================================
  // MUTATIONS
  // ========================================================================

  // Tier upgrade mutation
  const upgradeTier = useMutation({
    mutationFn: async (params: { new_tier: string; payment_method_id: string }) => {
      const response = await fetch('/api/quantum-commercial/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to upgrade tier');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quantum Tier Upgraded! 🚀",
        description: `Successfully upgraded to ${data.data.upgrade.new_tier}. New features are now active.`,
      });
      queryClient.invalidateQueries({ queryKey: ['quantum-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['quantum-credits'] });
    },
    onError: (error) => {
      toast({
        title: "Upgrade Failed",
        description: "Failed to upgrade quantum tier. Please check payment method.",
        variant: "destructive",
      });
    }
  });

  // Configuration update mutation
  const updateConfig = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch('/api/quantum-commercial/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to update configuration');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Quantum module configuration has been updated successfully.",
      });
      setConfigChanges({});
    }
  });

  // Credit purchase mutation
  const purchaseCredits = useMutation({
    mutationFn: async (params: { package_type: string; payment_method_id: string }) => {
      const response = await fetch('/api/quantum-commercial/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to purchase credits');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Credits Purchased! 💳",
        description: `Added ${data.data.purchase.credits_purchased} quantum credits to your account.`,
      });
      queryClient.invalidateQueries({ queryKey: ['quantum-credits'] });
    }
  });

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleTierUpgrade = (tierKey: string) => {
    setSelectedTier(tierKey);
    // Simulate payment method selection
    upgradeTier.mutate({
      new_tier: tierKey,
      payment_method_id: 'pm_simulated_payment_method'
    });
  };

  const handleConfigChange = (key: string, value: boolean) => {
    setConfigChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveConfig = () => {
    updateConfig.mutate(configChanges);
  };

  const handlePurchaseCredits = (packageType: string) => {
    purchaseCredits.mutate({
      package_type: packageType,
      payment_method_id: 'pm_simulated_payment_method'
    });
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderTierCard = (tierKey: string, tier: QuantumTier, isCurrent: boolean = false) => (
    <Card key={tierKey} className={`relative ${isCurrent ? 'ring-2 ring-purple-500' : 'hover:shadow-lg transition-shadow'}`}>
      {isCurrent && (
        <Badge className="absolute -top-2 left-4 bg-purple-500">
          Current Plan
        </Badge>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {tierKey === 'quantum_enterprise' && <Crown className="w-5 h-5 text-yellow-500" />}
            {tierKey === 'quantum_pro' && <Sparkles className="w-5 h-5 text-blue-500" />}
            {tierKey === 'quantum_lite' && <Atom className="w-5 h-5 text-green-500" />}
            {tier.name}
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${tier.price.monthly}
              <span className="text-sm font-normal text-gray-500">/month</span>
            </div>
            {tier.price.annual > 0 && (
              <div className="text-sm text-green-600">
                Save ${(tier.price.monthly * 12 - tier.price.annual)} annually
              </div>
            )}
          </div>
        </div>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Qubits</div>
            <div className="text-gray-600">{tier.features.qubits}</div>
          </div>
          <div>
            <div className="font-medium">Parallel Universes</div>
            <div className="text-gray-600">{tier.features.parallel_universes.toLocaleString()}</div>
          </div>
          <div>
            <div className="font-medium">Monthly Credits</div>
            <div className="text-gray-600">{tier.features.monthly_credits.toLocaleString()}</div>
          </div>
          <div>
            <div className="font-medium">Operations/Day</div>
            <div className="text-gray-600">{tier.features.operations_per_day}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium">Key Features:</div>
          <ul className="text-sm space-y-1">
            {tier.features.background_processing && (
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Background Processing
              </li>
            )}
            {tier.features.real_time_analytics && (
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Real-time Analytics
              </li>
            )}
            {tier.features.quantum_consulting && (
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Quantum Consulting
              </li>
            )}
            <li className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              SLA: {tier.features.sla}
            </li>
          </ul>
        </div>

        <div className="pt-2">
          <div className="text-sm font-medium text-green-600 mb-2">
            {tier.quantum_advantage}
          </div>
          <div className="text-xs text-gray-500 mb-4">
            {tier.ideal_for}
          </div>
          
          {!isCurrent && (
            <Button 
              onClick={() => handleTierUpgrade(tierKey)}
              disabled={upgradeTier.isPending}
              className="w-full"
              variant={tierKey === 'quantum_enterprise' ? 'default' : 'outline'}
            >
              {upgradeTier.isPending ? 'Upgrading...' : `Upgrade to ${tier.name}`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCreditPackage = (packageKey: string, packageInfo: any) => (
    <Card key={packageKey} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {packageKey}
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold">${packageInfo.price}</div>
            <div className="text-sm text-gray-500">
              ${(packageInfo.price / packageInfo.credits).toFixed(3)}/credit
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {packageInfo.credits.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Quantum Credits</div>
          {packageInfo.bonus && (
            <div className="text-sm text-green-600">
              + {packageInfo.bonus.toLocaleString()} bonus credits!
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => handlePurchaseCredits(packageKey)}
          disabled={purchaseCredits.isPending}
          className="w-full"
        >
          {purchaseCredits.isPending ? 'Processing...' : 'Purchase Credits'}
        </Button>
      </CardContent>
    </Card>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-purple-500" />
            Quantum Control Panel
          </h1>
          <p className="text-gray-600 mt-1">
            Gerenciar configurações e comercialização do Quantum ML Engine
          </p>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300">
          {tiers?.current_tier || 'quantum_lite'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creditUsage?.data?.current_balance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {creditUsage?.data?.usage_percentage || 0}% used this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${creditUsage?.data?.estimated_monthly_cost || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Trend: {creditUsage?.data?.usage_trend || 'stable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantum ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roiData?.data?.business_metrics?.roi_percentage ? 
                `${roiData.data.business_metrics.roi_percentage.toFixed(0)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Return on quantum investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roiData?.data?.roi_report?.summary?.total_time_saved_hours ? 
                `${roiData.data.roi_report.summary.total_time_saved_hours.toFixed(0)}h` : 
                '0h'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              This month via quantum processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Tiers</TabsTrigger>
          <TabsTrigger value="credits">Credits & Usage</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & ROI</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Quantum Module Status
                </CardTitle>
                <CardDescription>
                  Current configuration and active features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="background">Background Processing</Label>
                    <Switch 
                      id="background"
                      checked={configChanges.background_processing ?? true}
                      onCheckedChange={(checked) => handleConfigChange('background_processing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-opt">Auto Optimization</Label>
                    <Switch 
                      id="auto-opt"
                      checked={configChanges.auto_optimization ?? true}
                      onCheckedChange={(checked) => handleConfigChange('auto_optimization', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="real-time">Real-time Analytics</Label>
                    <Switch 
                      id="real-time"
                      checked={configChanges.real_time_analytics ?? true}
                      onCheckedChange={(checked) => handleConfigChange('real_time_analytics', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="insights">Quantum Insights Sharing</Label>
                    <Switch 
                      id="insights"
                      checked={configChanges.quantum_insights_sharing ?? false}
                      onCheckedChange={(checked) => handleConfigChange('quantum_insights_sharing', checked)}
                    />
                  </div>
                </div>

                {Object.keys(configChanges).length > 0 && (
                  <Button 
                    onClick={handleSaveConfig}
                    disabled={updateConfig.isPending}
                    className="w-full"
                  >
                    {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Usage Recommendations
                </CardTitle>
                <CardDescription>
                  Optimize your quantum investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {creditUsage?.data?.recommendations?.map((recommendation: string, index: number) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing & Tiers Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {tiers?.data && Object.entries(tiers.data).map(([tierKey, tier]: [string, any]) => 
              renderTierCard(tierKey, tier, tierKey === tiers.current_tier)
            )}
          </div>
        </TabsContent>

        {/* Credits & Usage Tab */}
        <TabsContent value="credits" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Credit Usage This Month</CardTitle>
                <CardDescription>
                  Track your quantum credit consumption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Used: {creditUsage?.data?.used_this_month?.toLocaleString() || 0}</span>
                    <span>Limit: {creditUsage?.data?.monthly_limit?.toLocaleString() || 0}</span>
                  </div>
                  <Progress 
                    value={creditUsage?.data?.usage_percentage || 0} 
                    className="h-3"
                  />
                  <div className="text-sm text-gray-600">
                    {creditUsage?.data?.current_balance?.toLocaleString() || 0} credits remaining
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Top Operations</h4>
                  <div className="space-y-2">
                    {creditUsage?.data?.top_operations?.map((op: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{op.operation}</span>
                        <div className="text-right text-sm">
                          <div>{op.count} operations</div>
                          <div className="text-gray-500">{op.credits} credits</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credit Packages</CardTitle>
                <CardDescription>
                  Purchase additional quantum credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {creditUsage?.data?.available_packages && 
                    Object.entries(creditUsage.data.available_packages).map(([packageKey, packageInfo]: [string, any]) => (
                      <div key={packageKey} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{packageKey}</div>
                            <div className="text-sm text-gray-500">
                              {packageInfo.credits.toLocaleString()} credits
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handlePurchaseCredits(packageKey)}
                            disabled={purchaseCredits.isPending}
                          >
                            ${packageInfo.price}
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics & ROI Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {roiData?.data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Business Impact Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {roiData.data.business_metrics.roi_percentage.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-500">ROI</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          ${roiData.data.business_metrics.net_present_value.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-500">Net Value</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Key Achievements:</h4>
                      {roiData.data.executive_summary.key_achievements.map((achievement: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quantum Operations Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {roiData.data.roi_report.by_operation.slice(0, 5).map((op: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">{op.operation}</span>
                          <Badge variant="outline">
                            {op.roi_multiple.toFixed(1)}x ROI
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{op.count} operations</span>
                          <span>${op.total_value_generated.toFixed(0)} value</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuantumControlPanel;