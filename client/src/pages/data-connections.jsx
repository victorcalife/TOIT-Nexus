import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {  
  Database, 
  Webhook, 
  Globe, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  TestTube,
  Plus,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle }
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UnifiedHeader } from "@/components/unified-header";

;
}

;
  headers, string>;
  rateLimit) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedTab, setSelectedTab] = useState('database');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Database connection form
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
    name,
    type,
    host,
    port,
    database,
    username,
    password,
    ssl);

  // Webhook configuration form
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    name,
    url,
    method,
    headers,
    authentication);

  // API configuration form
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    name,
    baseUrl,
    authentication, credentials,
    headers);

  // Fetch data connections
  const { data= [] } = useQuery<DataConnection[]>(({ queryKey,
    retry);

  // Test database connection
  const testDatabaseMutation = useMutation({
    mutationFn }) => {
      const response = await fetch('/api/data-connections/database/test', {
        method,
        headers,
        body),
      });
      return response.json();
    },
    onSuccess) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  // Create database connection
  const createDatabaseMutation = useMutation(({ mutationFn }) => {
      const response = await fetch('/api/data-connections/database', {
        method,
        headers,
        body),
      });
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setDialogOpen(false);
      toast({
        title,
        description,
      });
    }
  });

  // Test webhook
  const testWebhookMutation = useMutation(({ mutationFn }) => {
      const response = await fetch('/api/data-connections/webhook/test', {
        method,
        headers,
        body),
      });
      return response.json();
    },
    onSuccess) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  // Create webhook
  const createWebhookMutation = useMutation(({ mutationFn }) => {
      const response = await fetch('/api/data-connections/webhook', {
        method,
        headers,
        body),
      });
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setDialogOpen(false);
      toast({
        title,
        description,
      });
    }
  });

  // Test API connection
  const testApiMutation = useMutation(({ mutationFn }) => {
      const response = await fetch('/api/data-connections/api/test', {
        method,
        headers,
        body),
      });
      return response.json();
    },
    onSuccess) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  // Create API connection
  const createApiMutation = useMutation(({ mutationFn }) => {
      const response = await fetch('/api/data-connections/api', {
        method,
        headers,
        body),
      });
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setDialogOpen(false);
      toast({
        title,
        description,
      });
    }
  });

  // Upload file
  const uploadFileMutation = useMutation(({ mutationFn }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/data-connections/upload', {
        method,
        body,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      toast({
        title,
        description,
      });
    }
  });

  // Delete connection
  const deleteConnectionMutation = useMutation(({ mutationFn }) => {
      const response = await fetch(`/api/data-connections/${id}`, {
        method,
      });
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      toast({
        title,
        description,
      });
    }
  });

  // Export data to PDF
  const exportToPdf = async (data, title, columns) => {
    try {
      const response = await fetch('/api/data-connections/export/pdf', {
        method,
        headers,
        body, title, columns }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;`
      a.download = `${title}_export.pdf`;
      a.click();
      
      toast({
        title,
        description,
      });
    } catch (error) {
      toast({
        title,
        description,
        variant,
      });
    }
  };

  // Export data to Excel
  const exportToExcel = async (data, title) => {
    try {
      const response = await fetch('/api/data-connections/export/excel', {
        method,
        headers,
        body, title, sheetName),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;`
      a.download = `${title}_export.xlsx`;
      a.click();
      
      toast({
        title,
        description,
      });
    } catch (error) {
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const getConnectionIcon = (type) => {
    switch (type) {
      case 'database'="w-5 h-5" />;
      case 'webhook'="w-5 h-5" />;
      case 'api'="w-5 h-5" />;
      case 'file'="w-5 h-5" />;
      default="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status?) => {
    switch (status) {
      case 'active'="w-4 h-4 text-green-500" />;
      case 'error'="w-4 h-4 text-red-500" />;
      default="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark, APIs, webhooks e carregue arquivos
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Connections List */}
          <div className="col-span-12 lg) => setDatabaseConfig(prev => ({ ...prev, name))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dbType">Tipo</Label>
                              <Select
                                value={databaseConfig.type}
                                onValueChange=({ (type }) => setDatabaseConfig(prev => ({ ...prev, setWebhookConfig(prev => ({ ...prev, payload }));
                                  } catch (error) {
                                    // Invalid JSON, ignore
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick=({ ( }) => testWebhookMutation.mutate(webhookConfig)}
                              disabled={testWebhookMutation.isPending}
                              variant="outline"
                            >
                              <TestTube className="w-4 h-4 mr-2" />
                              Testar Webhook
                            </Button>
                            <Button
                              onClick=({ ( }) => createWebhookMutation.mutate(webhookConfig)}
                              disabled={createWebhookMutation.isPending}
                            >
                              Criar Webhook
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="api" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="apiName">Nome</Label>
                              <Input
                                id="apiName"
                                value={apiConfig.name}
                                onChange=({ (e }) => setApiConfig(prev => ({ ...prev, name))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="apiUrl">URL Base</Label>
                              <Input
                                id="apiUrl"
                                value={apiConfig.baseUrl}
                                onChange=({ (e }) => setApiConfig(prev => ({ ...prev, baseUrl))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="apiAuthType">Tipo de Autenticação</Label>
                              <Select
                                value={apiConfig.authentication.type}
                                onValueChange=({ (type }) => setApiConfig(prev => ({ 
                                  ...prev, 
                                  authentication, }`