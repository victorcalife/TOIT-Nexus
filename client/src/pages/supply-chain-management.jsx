/**
 * SISTEMA SUPPLY CHAIN MANAGEMENT COMPLETO - TOIT NEXUS
 * Sistema completo de gestão da cadeia de suprimentos
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
  Truck, 
  Package,
  Factory,
  MapPin,
  Route,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Star,
  Flag,
  Tag,
  Hash,
  User,
  Users,
  Calendar,
  Building,
  Briefcase,
  Globe,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  Link,
  ExternalLink,
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
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  SkipForward,
  Zap,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Layers,
  GitBranch,
  GitCommit,
  GitMerge,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Navigation,
  Compass,
  Map,
  Radar,
  Satellite,
  Anchor,
  Ship,
  Plane,
  Train,
  Car,
  Bike,
  ShoppingCart,
  Store,
  Warehouse,
  Container,
  Box,
  PackageCheck,
  PackageX,
  PackagePlus,
  PackageMinus
} from 'lucide-react';

const SupplyChainManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [procurement, setProcurement] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    supplier: 'all',
    warehouse: 'all',
    priority: 'all',
    type: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  
  const { toast } = useToast();

  // Status dos pedidos
  const orderStatuses = {
    draft: { name: 'Rascunho', color: 'text-gray-600 bg-gray-100', icon: <Package className="h-3 w-3" /> },
    pending: { name: 'Pendente', color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="h-3 w-3" /> },
    approved: { name: 'Aprovado', color: 'text-blue-600 bg-blue-100', icon: <CheckCircle className="h-3 w-3" /> },
    processing: { name: 'Processando', color: 'text-purple-600 bg-purple-100', icon: <Activity className="h-3 w-3" /> },
    shipped: { name: 'Enviado', color: 'text-orange-600 bg-orange-100', icon: <Truck className="h-3 w-3" /> },
    delivered: { name: 'Entregue', color: 'text-green-600 bg-green-100', icon: <PackageCheck className="h-3 w-3" /> },
    cancelled: { name: 'Cancelado', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  // Status dos embarques
  const shipmentStatuses = {
    preparing: { name: 'Preparando', color: 'text-blue-600 bg-blue-100', icon: <Package className="h-3 w-3" /> },
    in_transit: { name: 'Em Trânsito', color: 'text-yellow-600 bg-yellow-100', icon: <Truck className="h-3 w-3" /> },
    customs: { name: 'Alfândega', color: 'text-purple-600 bg-purple-100', icon: <Shield className="h-3 w-3" /> },
    out_for_delivery: { name: 'Saiu para Entrega', color: 'text-orange-600 bg-orange-100', icon: <Navigation className="h-3 w-3" /> },
    delivered: { name: 'Entregue', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    delayed: { name: 'Atrasado', color: 'text-red-600 bg-red-100', icon: <AlertTriangle className="h-3 w-3" /> }
  };

  // Prioridades
  const priorities = {
    low: { name: 'Baixa', color: 'text-green-600 bg-green-100' },
    medium: { name: 'Média', color: 'text-yellow-600 bg-yellow-100' },
    high: { name: 'Alta', color: 'text-orange-600 bg-orange-100' },
    urgent: { name: 'Urgente', color: 'text-red-600 bg-red-100' }
  };

  // Tipos de transporte
  const transportTypes = {
    road: { name: 'Rodoviário', color: 'text-blue-600 bg-blue-100', icon: <Truck className="h-3 w-3" /> },
    air: { name: 'Aéreo', color: 'text-purple-600 bg-purple-100', icon: <Plane className="h-3 w-3" /> },
    sea: { name: 'Marítimo', color: 'text-teal-600 bg-teal-100', icon: <Ship className="h-3 w-3" /> },
    rail: { name: 'Ferroviário', color: 'text-orange-600 bg-orange-100', icon: <Train className="h-3 w-3" /> }
  };

  /**
   * CARREGAR DADOS DO SUPPLY CHAIN
   */
  const loadSupplyChainData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, ordersRes, shipmentsRes, warehousesRes, logisticsRes, procurementRes, trackingRes] = await Promise.all([
        fetch('/api/supply-chain/suppliers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/supply-chain/orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/supply-chain/shipments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/supply-chain/warehouses', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/supply-chain/logistics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/supply-chain/procurement', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/supply-chain/tracking', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData.suppliers || []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      if (shipmentsRes.ok) {
        const shipmentsData = await shipmentsRes.json();
        setShipments(shipmentsData.shipments || []);
      }

      if (warehousesRes.ok) {
        const warehousesData = await warehousesRes.json();
        setWarehouses(warehousesData.warehouses || []);
      }

      if (logisticsRes.ok) {
        const logisticsData = await logisticsRes.json();
        setLogistics(logisticsData.logistics || []);
      }

      if (procurementRes.ok) {
        const procurementData = await procurementRes.json();
        setProcurement(procurementData.procurement || []);
      }

      if (trackingRes.ok) {
        const trackingData = await trackingRes.json();
        setTracking(trackingData.tracking || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do supply chain:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do supply chain",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR PEDIDO
   */
  const createOrder = async (orderData) => {
    try {
      const response = await fetch('/api/supply-chain/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...orderData,
          status: 'draft',
          createdAt: new Date().toISOString(),
          orderNumber: `PO-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pedido');
      }

      const data = await response.json();
      setOrders(prev => [data.order, ...prev]);
      setShowOrderModal(false);
      
      toast({
        title: "Pedido criado",
        description: `Pedido ${data.order.orderNumber} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pedido",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DO PEDIDO
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/supply-chain/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do pedido');
      }

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status do pedido atualizado com sucesso",
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
   * CRIAR EMBARQUE
   */
  const createShipment = async (shipmentData) => {
    try {
      const response = await fetch('/api/supply-chain/shipments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...shipmentData,
          status: 'preparing',
          createdAt: new Date().toISOString(),
          trackingNumber: `TRK-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar embarque');
      }

      const data = await response.json();
      setShipments(prev => [data.shipment, ...prev]);
      setShowShipmentModal(false);
      
      toast({
        title: "Embarque criado",
        description: `Embarque ${data.shipment.trackingNumber} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar embarque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o embarque",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR PEDIDO
   */
  const renderOrder = (order) => {
    const status = orderStatuses[order.status] || orderStatuses.draft;
    const priority = priorities[order.priority] || priorities.medium;
    const supplier = suppliers.find(s => s.id === order.supplierId);
    const warehouse = warehouses.find(w => w.id === order.warehouseId);
    
    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                <Badge className={priority.color}>
                  {priority.name}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">{supplier ? supplier.name : 'Fornecedor não encontrado'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {order.items?.length || 0} itens • R$ {order.totalAmount?.toLocaleString() || '0,00'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.name}</span>
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Destino: {warehouse ? warehouse.name : 'Não definido'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Criado: {new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Entrega prevista: {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString('pt-BR') : 'Não definida'}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{order.items?.length || 0}</div>
              <div className="text-xs text-gray-600">Itens</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                R$ {order.totalAmount?.toLocaleString() || '0,00'}
              </div>
              <div className="text-xs text-gray-600">Valor Total</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{order.shipments?.length || 0}</div>
              <div className="text-xs text-gray-600">Embarques</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {Object.entries(orderStatuses).map(([key, status]) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(order)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR EMBARQUE
   */
  const renderShipment = (shipment) => {
    const status = shipmentStatuses[shipment.status] || shipmentStatuses.preparing;
    const transport = transportTypes[shipment.transportType] || transportTypes.road;
    const order = orders.find(o => o.id === shipment.orderId);
    
    return (
      <Card key={shipment.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{shipment.trackingNumber}</h3>
                <Badge className={transport.color}>
                  {transport.icon}
                  <span className="ml-1">{transport.name}</span>
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">
                {order ? order.orderNumber : 'Pedido não encontrado'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {shipment.carrier || 'Transportadora não definida'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.name}</span>
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Origem: {shipment.origin || 'Não definida'}
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Destino: {shipment.destination || 'Não definido'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Enviado: {shipment.shippedDate ? new Date(shipment.shippedDate).toLocaleDateString('pt-BR') : 'Não enviado'}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Entrega prevista: {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString('pt-BR') : 'Não definida'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{shipment.packages || 0}</div>
              <div className="text-xs text-gray-600">Pacotes</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{shipment.weight || 0} kg</div>
              <div className="text-xs text-gray-600">Peso</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Navigation className="h-3 w-3 mr-1" />
              Rastrear
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-3 w-3 mr-1" />
              Etiqueta
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR FORNECEDOR
   */
  const renderSupplier = (supplier) => {
    const supplierOrders = orders.filter(o => o.supplierId === supplier.id);
    const activeOrders = supplierOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
    const totalValue = supplierOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    return (
      <Card key={supplier.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{supplier.name}</h3>
              <p className="text-gray-600 text-sm">{supplier.category || 'Categoria não definida'}</p>
              <p className="text-xs text-gray-500 mt-1">{supplier.code || 'Código não definido'}</p>
            </div>
            <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
              {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {supplier.email || 'Email não informado'}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {supplier.phone || 'Telefone não informado'}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {supplier.address || 'Endereço não informado'}
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avaliação: {supplier.rating || 0}/5
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{supplierOrders.length}</div>
              <div className="text-xs text-gray-600">Pedidos</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{activeOrders}</div>
              <div className="text-xs text-gray-600">Ativos</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                R$ {totalValue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Novo Pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR DEPÓSITO
   */
  const renderWarehouse = (warehouse) => {
    const warehouseOrders = orders.filter(o => o.warehouseId === warehouse.id);
    const capacity = warehouse.capacity || 0;
    const occupied = warehouse.occupied || 0;
    const occupancyRate = capacity > 0 ? (occupied / capacity * 100).toFixed(0) : 0;
    
    return (
      <Card key={warehouse.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{warehouse.name}</h3>
              <p className="text-gray-600 text-sm">{warehouse.type || 'Tipo não definido'}</p>
              <p className="text-xs text-gray-500 mt-1">{warehouse.code || 'Código não definido'}</p>
            </div>
            <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
              {warehouse.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          {/* Taxa de Ocupação */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Ocupação</span>
              <span className="font-medium">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  occupancyRate > 90 ? 'bg-red-600' : 
                  occupancyRate > 70 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {warehouse.address || 'Endereço não informado'}
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Capacidade: {capacity.toLocaleString()} m³
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ocupado: {occupied.toLocaleString()} m³
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{warehouseOrders.length}</div>
              <div className="text-xs text-gray-600">Pedidos</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{warehouse.zones || 0}</div>
              <div className="text-xs text-gray-600">Zonas</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Layout
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-3 w-3 mr-1" />
              Relatório
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-3 w-3 mr-1" />
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
    const totalShipments = shipments.length;
    const inTransitShipments = shipments.filter(s => s.status === 'in_transit').length;
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
    const totalWarehouses = warehouses.length;
    const totalValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    return { 
      totalOrders, 
      activeOrders, 
      totalShipments, 
      inTransitShipments, 
      totalSuppliers, 
      activeSuppliers, 
      totalWarehouses, 
      totalValue 
    };
  };

  const stats = getStats();

  /**
   * FILTRAR PEDIDOS
   */
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    const matchesSupplier = filters.supplier === 'all' || order.supplierId === filters.supplier;
    const matchesWarehouse = filters.warehouse === 'all' || order.warehouseId === filters.warehouse;
    const matchesPriority = filters.priority === 'all' || order.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesWarehouse && matchesPriority;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadSupplyChainData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-600" />
                Supply Chain Management
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de gestão da cadeia de suprimentos
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadSupplyChainData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowShipmentModal(true)}
              >
                <Truck className="h-4 w-4 mr-2" />
                Novo Embarque
              </Button>
              <Button
                onClick={() => setShowOrderModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-500">{stats.activeOrders} ativos</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Embarques</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalShipments}</p>
                  <p className="text-xs text-gray-500">{stats.inTransitShipments} em trânsito</p>
                </div>
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fornecedores</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalSuppliers}</p>
                  <p className="text-xs text-gray-500">{stats.activeSuppliers} ativos</p>
                </div>
                <Factory className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {stats.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{stats.totalWarehouses} depósitos</p>
                </div>
                <Warehouse className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do Supply Chain */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="shipments">Embarques</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="warehouses">Depósitos</TabsTrigger>
            <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar pedidos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      {Object.entries(orderStatuses).map(([key, status]) => (
                        <option key={key} value={key}>{status.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.supplier}
                      onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Fornecedores</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Prioridades</option>
                      {Object.entries(priorities).map(([key, priority]) => (
                        <option key={key} value={key}>{priority.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Pedidos */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando pedidos...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum pedido encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece criando seu primeiro pedido de compra
                  </p>
                  <Button onClick={() => setShowOrderModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Pedido
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map(renderOrder)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6">
            {/* Lista de Embarques */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando embarques...</span>
              </div>
            ) : shipments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum embarque encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Os embarques aparecerão aqui quando criados
                  </p>
                  <Button onClick={() => setShowShipmentModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Embarque
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shipments.map(renderShipment)}
              </div>
            )}
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
                  <Factory className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum fornecedor encontrado
                  </h3>
                  <p className="text-gray-500">
                    Cadastre fornecedores para gerenciar sua cadeia de suprimentos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(renderSupplier)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="warehouses" className="space-y-6">
            {/* Lista de Depósitos */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando depósitos...</span>
              </div>
            ) : warehouses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Warehouse className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum depósito encontrado
                  </h3>
                  <p className="text-gray-500">
                    Configure depósitos para gerenciar seu estoque
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map(renderWarehouse)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardContent className="p-12 text-center">
                <Navigation className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sistema de Rastreamento
                </h3>
                <p className="text-gray-500">
                  Rastreamento em tempo real de embarques será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Pedido</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowOrderModal(false)}>
                  Cancelar
                </Button>
                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Pedido'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplyChainManagement;
