/**
 * SISTEMA E-COMMERCE COMPLETO - TOIT NEXUS
 * Sistema completo de comércio eletrônico
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
  ShoppingCart, 
  Package,
  DollarSign,
  TrendingUp,
  Star,
  Heart,
  Eye,
  Plus,
  Minus,
  Edit,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Tag,
  Percent,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Image,
  Upload,
  Download,
  RefreshCw,
  Settings,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  Award,
  Bookmark }
} from 'lucide-react';

const EcommerceSystem = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    status: 'all',
    rating: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  
  const { toast } = useToast();

  // Status dos pedidos
  const orderStatuses = {
    pending: { name: 'Pendente', color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="h-3 w-3" /> },
    confirmed: { name: 'Confirmado', color: 'text-blue-600 bg-blue-100', icon: <CheckCircle className="h-3 w-3" /> },
    processing: { name: 'Processando', color: 'text-purple-600 bg-purple-100', icon: <Package className="h-3 w-3" /> },
    shipped: { name: 'Enviado', color: 'text-orange-600 bg-orange-100', icon: <Truck className="h-3 w-3" /> },
    delivered: { name: 'Entregue', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    cancelled: { name: 'Cancelado', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  /**
   * CARREGAR DADOS DO E-COMMERCE
   */
  const loadEcommerceData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, customersRes, categoriesRes] = await Promise.all([
        fetch('/api/ecommerce/products', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/ecommerce/orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/ecommerce/customers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/ecommerce/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.customers || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do e-commerce:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do e-commerce",
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
      const response = await fetch('/api/ecommerce/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productData,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar produto');
      }

      const data = await response.json();
      setProducts(prev => [data.product, ...prev]);
      setShowProductModal(false);
      
      toast({
        title: "Produto criado",
        description: "Produto criado com sucesso",
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
   * ADICIONAR AO CARRINHO
   */
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
    
    toast({
      title: "Produto adicionado",`
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  /**
   * REMOVER DO CARRINHO
   */
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    
    toast({
      title: "Produto removido",
      description: "Produto removido do carrinho",
    });
  };

  /**
   * ATUALIZAR QUANTIDADE NO CARRINHO
   */
  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  /**
   * FINALIZAR PEDIDO
   */
  const createOrder = async (orderData) => {
    try {
      const response = await fetch('/api/ecommerce/orders', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...orderData,
          items: cart,
          total: getCartTotal(),
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pedido');
      }

      const data = await response.json();
      setOrders(prev => [data.order, ...prev]);
      setCart([]); // Limpar carrinho
      
      toast({
        title: "Pedido criado",`
        description: `Pedido #${data.order.id} criado com sucesso`,
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
    try {`
      const response = await fetch(`/api/ecommerce/orders/${orderId}/status`, {
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
   * CALCULAR TOTAL DO CARRINHO
   */
  const getCartTotal = () => ({ return cart.reduce((total, item }) => total + (item.price * item.quantity), 0);
  };

  /**
   * RENDERIZAR CARD DE PRODUTO
   */
  const renderProductCard = (product) => {
    const isInCart = cart.some(item => item.id === product.id);
    const cartItem = cart.find(item => item.id === product.id);
    
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
          
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{product.discount}%
            </Badge>
          )}
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick=({ ( }) => {
                // Implementar favoritos
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick=({ ( }) => setSelectedProduct(product)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              ({ [...Array(5)].map((_, i }) => (
                <Star
                  key={i}`
                  className={`h-4 w-4 ${
                    i < (product.rating || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'`}
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviewCount || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                R$ {product.price?.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  R$ {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>`
              {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            ({ isInCart ? (
              <div className="flex items-center gap-2 flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={( }) => updateCartQuantity(product.id, cartItem.quantity - 1)}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium">{cartItem.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick=({ ( }) => updateCartQuantity(product.id, cartItem.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                onClick=({ ( }) => addToCart(product)}
                disabled={product.stock <= 0}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />

            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => setSelectedProduct(product)}
              className="h-9 w-9 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR PEDIDO
   */
  const renderOrder = (order) => {
    const status = orderStatuses[order.status] || orderStatuses.pending;
    const customer = customers.find(c => c.id === order.customerId);
    
    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
              <p className="text-gray-600 text-sm">
                {customer ? customer.name : 'Cliente não encontrado'}
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
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Data do Pedido:</span>
              <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Itens:</span>
              <span>{order.items?.length || 0} produtos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-green-600">
                R$ {order.total?.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={order.status}
              onChange=({ (e }) => updateOrderStatus(order.id, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              ({ Object.entries(orderStatuses).map(([key, status] }) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => setShowOrderModal(true)}
            >
              <Eye className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR CARRINHO
   */
  const renderCart = () => {
    if (cart.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Carrinho vazio
            </h3>
            <p className="text-gray-500">
              Adicione produtos ao seu carrinho para continuar
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Carrinho de Compras
            <Badge variant="outline">{cart.length} itens</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            ({ cart.map((item }) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick=({ ( }) => updateCartQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick=({ ( }) => updateCartQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <div className="font-bold">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick=({ ( }) => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  R$ {getCartTotal().toFixed(2)}
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick=({ ( }) => setCart([])}
                  className="flex-1"
                >
                  Limpar Carrinho
                </Button>
                <Button
                  onClick=({ ( }) => {
                    // Implementar checkout
                    createOrder({
                      customerId: 'current-user', // Substituir pelo ID do usuário atual
                      shippingAddress: 'Endereço padrão',
                      paymentMethod: 'credit_card'
                    });
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Finalizar Compra
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => ({ const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order }) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { totalProducts, totalOrders, totalRevenue, pendingOrders, averageOrderValue };
  };

  const stats = getStats();

  /**
   * FILTRAR PRODUTOS
   */
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filters.category === 'all' || product.categoryId === filters.category;
    
    return matchesSearch && matchesCategory;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadEcommerceData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                Sistema E-commerce
              </h1>
              <p className="text-gray-600 mt-2">
                Plataforma completa de comércio eletrônico
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadEcommerceData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowProductModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
              <Button
                onClick=({ ( }) => setActiveTab('cart')}
                className="bg-green-600 hover:bg-green-700 relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Carrinho
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-600">Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {stats.averageOrderValue.toFixed(0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do E-commerce */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="cart">Carrinho ({cart.length})</TabsTrigger>
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick=({ ( }) => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
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
                    Comece adicionando seu primeiro produto
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

          <TabsContent value="orders" className="space-y-6">
            {/* Lista de Pedidos */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando pedidos...</span>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum pedido encontrado
                  </h3>
                  <p className="text-gray-500">
                    Os pedidos aparecerão aqui quando forem criados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(renderOrder)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gestão de Clientes
                </h3>
                <p className="text-gray-500">
                  Sistema de clientes será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cart">
            {renderCart()}
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

export default EcommerceSystem;
`