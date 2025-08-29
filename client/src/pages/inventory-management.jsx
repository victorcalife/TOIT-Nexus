/**
 * SISTEMA INVENTORY MANAGEMENT COMPLETO - TOIT NEXUS
 * Sistema completo de gestão de estoque
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {  
  Package, 
  PackageCheck,
  PackageX,
  Warehouse,
  Truck,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Activity,
  Zap,
  Star,
  Tag,
  Hash,
  DollarSign,
  Percent,
  Calendar,
  MapPin,
  Building,
  User,
  Users,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Archive,
  Share,
  Copy,
  Move,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Scan,
  QrCode,
  Barcode,
  Camera,
  Image,
  FileText,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  Globe,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  Link,
  ExternalLink }
} from 'lucide-react';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [movements, setMovements] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    supplier: 'all',
    warehouse: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  
  const { toast } = useToast();

  // Status dos produtos
  const productStatuses = {
    active: { name: 'Ativo', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    inactive: { name: 'Inativo', color: 'text-gray-600 bg-gray-100', icon: <XCircle className="h-3 w-3" /> },
    discontinued: { name: 'Descontinuado', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> },
    out_of_stock: { name: 'Sem Estoque', color: 'text-orange-600 bg-orange-100', icon: <AlertTriangle className="h-3 w-3" /> }
  };

  // Tipos de movimento
  const movementTypes = {
    in: { name: 'Entrada', color: 'text-green-600 bg-green-100', icon: <ArrowDown className="h-3 w-3" /> },
    out: { name: 'Saída', color: 'text-red-600 bg-red-100', icon: <ArrowUp className="h-3 w-3" /> },
    transfer: { name: 'Transferência', color: 'text-blue-600 bg-blue-100', icon: <ArrowRight className="h-3 w-3" /> },
    adjustment: { name: 'Ajuste', color: 'text-purple-600 bg-purple-100', icon: <Edit className="h-3 w-3" /> }
  };

  // Níveis de alerta
  const alertLevels = {
    low: { name: 'Baixo', color: 'text-yellow-600 bg-yellow-100' },
    critical: { name: 'Crítico', color: 'text-red-600 bg-red-100' },
    out: { name: 'Esgotado', color: 'text-red-600 bg-red-100' }
  };

  /**
   * CARREGAR DADOS DO ESTOQUE
   */
  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, suppliersRes, warehousesRes, movementsRes, alertsRes, ordersRes] = await Promise.all([
        fetch('/api/inventory/products', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/inventory/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/inventory/suppliers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/inventory/warehouses', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/inventory/movements', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/inventory/alerts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/inventory/orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData.suppliers || []);
      }

      if (warehousesRes.ok) {
        const warehousesData = await warehousesRes.json();
        setWarehouses(warehousesData.warehouses || []);
      }

      if (movementsRes.ok) {
        const movementsData = await movementsRes.json();
        setMovements(movementsData.movements || []);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setStockAlerts(alertsData.alerts || []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do estoque",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR PRODUTO
   */
  const createProduct = async (productData) => {
    try {
      const response = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productData,
          status: 'active',
          createdAt: new Date().toISOString(),`
          sku: `SKU-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar produto');
      }

      const data = await response.json();
      setProducts(prev => [data.product, ...prev]);
      setShowProductModal(false);
      
      toast({
        title: "Produto criado",`
        description: `Produto ${data.product.name} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o produto",
        variant: "destructive"
      });
    }
  };

  /**
   * CRIAR MOVIMENTO DE ESTOQUE
   */
  const createMovement = async (movementData) => {
    try {
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...movementData,
          createdAt: new Date().toISOString(),`
          movementId: `MOV-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar movimento');
      }

      const data = await response.json();
      setMovements(prev => [data.movement, ...prev]);
      
      // Atualizar estoque do produto
      setProducts(prev => prev.map(product => 
        product.id === movementData.productId 
          ? { 
              ...product, 
              stock: movementData.type === 'in' 
                ? product.stock + movementData.quantity
                : product.stock - movementData.quantity
            }
          : product
      ));
      
      setShowMovementModal(false);
      
      toast({
        title: "Movimento registrado",`
        description: `Movimento de ${movementData.type} registrado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar movimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o movimento",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DO PRODUTO
   */
  const updateProductStatus = async (productId, newStatus) => {
    try {`
      const response = await fetch(`/api/inventory/products/${productId}/status`, {
        method: 'PATCH',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, status: newStatus, updatedAt: new Date().toISOString() }
          : product
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status do produto atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR CARD DE PRODUTO
   */
  const renderProductCard = (product) => {
    const status = productStatuses[product.status] || productStatuses.active;
    const category = categories.find(c => c.id === product.categoryId);
    const supplier = suppliers.find(s => s.id === product.supplierId);
    const stockLevel = product.stock <= product.minStock ? 'low' : 'normal';
    
    return (
      <Card key={product.id} className="hover:shadow-lg transition-shadow group">
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="absolute top-2 left-2">
            <Badge className={status.color}>
              {status.icon}
              <span className="ml-1">{status.name}</span>
            </Badge>
          </div>
          
          <div className="absolute top-2 right-2">
            {stockLevel === 'low' && (
              <Badge className="text-red-600 bg-red-100">
                <AlertTriangle className="h-3 w-3 mr-1" />

            )}
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="mb-3">
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {category ? category.name : 'Sem categoria'}
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {supplier ? supplier.name : 'Sem fornecedor'}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              R$ {product.price?.toFixed(2) || '0,00'}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">`
              <div className={`text-lg font-bold ${stockLevel === 'low' ? 'text-red-600' : 'text-blue-600'}`}>
                {product.stock || 0}
              </div>
              <div className="text-xs text-gray-600">Estoque</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{product.minStock || 0}</div>
              <div className="text-xs text-gray-600">Mínimo</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{product.maxStock || 0}</div>
              <div className="text-xs text-gray-600">Máximo</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={product.status}
              onChange=({ (e }) => updateProductStatus(product.id, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              ({ Object.entries(productStatuses).map(([key, status] }) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => setSelectedProduct(product)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR MOVIMENTO
   */
  const renderMovement = (movement) => {
    const type = movementTypes[movement.type] || movementTypes.in;
    const product = products.find(p => p.id === movement.productId);
    const warehouse = warehouses.find(w => w.id === movement.warehouseId);
    
    return (
      <div key={movement.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
        <div className="flex items-center gap-4">`
          <div className={`p-2 rounded-full ${type.color}`}>
            {type.icon}
          </div>
          
          <div>
            <h4 className="font-medium">{product ? product.name : 'Produto não encontrado'}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{type.name}</span>
              <span>{warehouse ? warehouse.name : 'Depósito não encontrado'}</span>
              <span>{new Date(movement.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            {movement.reason && (
              <p className="text-sm text-gray-600 mt-1">{movement.reason}</p>
            )}
          </div>
        </div>
        
        <div className="text-right">`
          <div className={`font-bold text-lg ${
            movement.type === 'in' ? 'text-green-600' : 'text-red-600'`}
          }`}>
            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
          </div>
          <div className="text-sm text-gray-500">
            {movement.movementId}
          </div>
        </div>
      </div>
    );
  };

  /**
   * RENDERIZAR FORNECEDOR
   */
  const renderSupplier = (supplier) => {
    const supplierProducts = products.filter(p => p.supplierId === supplier.id);
    
    return (
      <Card key={supplier.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{supplier.name}</h3>
              <p className="text-gray-600 text-sm">{supplier.company}</p>
            </div>
            <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
              {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {supplier.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {supplier.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {supplier.address}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{supplierProducts.length}</div>
              <div className="text-xs text-gray-600">Produtos</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                {supplier.rating || 0}
              </div>
              <div className="text-xs text-gray-600">Avaliação</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR ALERTA DE ESTOQUE
   */
  const renderStockAlert = (alert) => {
    const level = alertLevels[alert.level] || alertLevels.low;
    const product = products.find(p => p.id === alert.productId);
    
    return (
      <Card key={alert.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">
                {product ? product.name : 'Produto não encontrado'}
              </h3>
              <p className="text-gray-600 text-sm">{alert.message}</p>
            </div>
            <Badge className={level.color}>
              {level.name}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Estoque atual:</span>
              <span className="font-medium">{alert.currentStock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estoque mínimo:</span>
              <span className="font-medium">{alert.minStock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data do alerta:</span>
              <span>{new Date(alert.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Repor Estoque
            </Button>
            <Button variant="outline" size="sm">
              <XCircle className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => ({ const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalStockValue = products.reduce((sum, p }) => sum + ((p.stock || 0) * (p.price || 0)), 0);
    const totalMovements = movements.length;
    
    return { 
      totalProducts, 
      activeProducts, 
      lowStockProducts, 
      outOfStockProducts, 
      totalStockValue, 
      totalMovements 
    };
  };

  const stats = getStats();

  /**
   * FILTRAR PRODUTOS
   */
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filters.category === 'all' || product.categoryId === filters.category;
    const matchesSupplier = filters.supplier === 'all' || product.supplierId === filters.supplier;
    const matchesStatus = filters.status === 'all' || product.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadInventoryData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Warehouse className="h-8 w-8 text-blue-600" />
                Inventory Management
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de gestão de estoque
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadInventoryData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowMovementModal(true)}
              >
                <ArrowRight className="h-4 w-4 mr-2" />

              <Button
                onClick=({ ( }) => setShowProductModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
                </div>
                <PackageCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</p>
                </div>
                <PackageX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {stats.totalStockValue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Movimentos</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalMovements}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do Inventory Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="movements">Movimentos</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange=({ (e }) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.category}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Categorias</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.supplier}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Fornecedores</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.status}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      ({ Object.entries(productStatuses).map(([key, status] }) => (
                        <option key={key} value={key}>{status.name}</option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick=({ ( }) => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <ClipboardList className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Produtos */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando produtos...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece adicionando seu primeiro produto ao estoque
                  </p>
                  <Button onClick={( }) => setShowProductModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'}
              }>
                {filteredProducts.map(renderProductCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="movements" className="space-y-6">
            {/* Lista de Movimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Movimentos de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Carregando movimentos...</span>
                  </div>
                ) : movements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum movimento registrado</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {movements.map(renderMovement)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            {/* Lista de Fornecedores */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando fornecedores...</span>
              </div>
            ) : suppliers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum fornecedor encontrado
                  </h3>
                  <p className="text-gray-500">
                    Adicione fornecedores para gerenciar seus produtos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(renderSupplier)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {/* Lista de Alertas */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando alertas...</span>
              </div>
            ) : stockAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum alerta ativo
                  </h3>
                  <p className="text-gray-500">
                    Todos os produtos estão com estoque adequado
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stockAlerts.map(renderStockAlert)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Relatórios de Estoque
                </h3>
                <p className="text-gray-500">
                  Relatórios detalhados de estoque serão implementados aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Produto</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick=({ ( }) => setShowProductModal(false)}>

                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Produto'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
`