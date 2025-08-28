/**
 * SISTEMA DIGITAL ASSET MANAGEMENT COMPLETO - TOIT NEXUS
 * Sistema completo de gestão de ativos digitais
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
  Image, 
  Video,
  FileText,
  FileAudio,
  File,
  Folder,
  FolderOpen,
  HardDrive,
  Cloud,
  Download,
  Upload,
  Share,
  Copy,
  Move,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Star,
  Heart,
  Bookmark,
  Tag,
  Hash,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  RefreshCw,
  Settings,
  Bell,
  Archive,
  Link,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Palette,
  Layers,
  Type,
  PenTool,
  Brush,
  Eraser,
  Scissors,
  Wand2,
  Sparkles,
  Globe,
  Lock,
  Unlock,
  Shield,
  Key,
  Database,
  Server,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Camera,
  Mic,
  Headphones,
  Speaker,
  Printer,
  Scanner,
  Projector,
  Tv,
  Radio,
  Gamepad2,
  Joystick,
  Mouse,
  Keyboard,
  Usb,
  Wifi,
  Bluetooth,
  Nfc,
  QrCode,
  Barcode,
  CreditCard,
  Banknote,
  Coins,
  Wallet,
  ShoppingBag,
  ShoppingCart,
  Store,
  Building,
  Home,
  MapPin,
  Navigation,
  Compass,
  Map,
  Route,
  Car,
  Truck,
  Plane,
  Train,
  Ship,
  Bike,
  Scooter,
  Bus,
  Taxi }
} from 'lucide-react';

const DigitalAssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [versions, setVersions] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    type: 'all',
    collection: 'all',
    status: 'all',
    author: 'all',
    tag: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('assets');
  
  const { toast } = useToast();

  // Tipos de arquivo
  const fileTypes = {
    image: { name: 'Imagem', color: 'text-green-600 bg-green-100', icon: <Image className="h-3 w-3" /> },
    video: { name: 'Vídeo', color: 'text-purple-600 bg-purple-100', icon: <Video className="h-3 w-3" /> },
    audio: { name: 'Áudio', color: 'text-blue-600 bg-blue-100', icon: <FileAudio className="h-3 w-3" /> },
    document: { name: 'Documento', color: 'text-orange-600 bg-orange-100', icon: <FileText className="h-3 w-3" /> },
    archive: { name: 'Arquivo', color: 'text-gray-600 bg-gray-100', icon: <File className="h-3 w-3" /> },
    other: { name: 'Outro', color: 'text-red-600 bg-red-100', icon: <File className="h-3 w-3" /> }
  };

  // Status dos ativos
  const assetStatuses = {
    draft: { name: 'Rascunho', color: 'text-gray-600 bg-gray-100', icon: <Edit className="h-3 w-3" /> },
    review: { name: 'Em Revisão', color: 'text-yellow-600 bg-yellow-100', icon: <Eye className="h-3 w-3" /> },
    approved: { name: 'Aprovado', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    published: { name: 'Publicado', color: 'text-blue-600 bg-blue-100', icon: <Globe className="h-3 w-3" /> },
    archived: { name: 'Arquivado', color: 'text-orange-600 bg-orange-100', icon: <Archive className="h-3 w-3" /> },
    expired: { name: 'Expirado', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  // Níveis de acesso
  const accessLevels = {
    public: { name: 'Público', color: 'text-green-600 bg-green-100', icon: <Globe className="h-3 w-3" /> },
    internal: { name: 'Interno', color: 'text-blue-600 bg-blue-100', icon: <Building className="h-3 w-3" /> },
    restricted: { name: 'Restrito', color: 'text-orange-600 bg-orange-100', icon: <Lock className="h-3 w-3" /> },
    confidential: { name: 'Confidencial', color: 'text-red-600 bg-red-100', icon: <Shield className="h-3 w-3" /> }
  };

  /**
   * CARREGAR DADOS DO DAM
   */
  const loadDAMData = async () => {
    setLoading(true);
    try {
      const [assetsRes, collectionsRes, tagsRes, metadataRes, versionsRes, permissionsRes, workflowsRes] = await Promise.all([
        fetch('/api/dam/assets', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/dam/collections', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/dam/tags', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/dam/metadata', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/dam/versions', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/dam/permissions', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/dam/workflows', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        setAssets(assetsData.assets || []);
      }

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData.collections || []);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.tags || []);
      }

      if (metadataRes.ok) {
        const metadataData = await metadataRes.json();
        setMetadata(metadataData.metadata || []);
      }

      if (versionsRes.ok) {
        const versionsData = await versionsRes.json();
        setVersions(versionsData.versions || []);
      }

      if (permissionsRes.ok) {
        const permissionsData = await permissionsRes.json();
        setPermissions(permissionsData.permissions || []);
      }

      if (workflowsRes.ok) {
        const workflowsData = await workflowsRes.json();
        setWorkflows(workflowsData.workflows || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do DAM:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do DAM",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * FAZER UPLOAD DE ATIVO
   */
  const uploadAsset = async (assetData) => {
    try {
      const response = await fetch('/api/dam/assets/upload', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...assetData,
          status: 'draft',
          uploadedAt: new Date().toISOString(),`
          assetId: `AST-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do ativo');
      }

      const data = await response.json();
      setAssets(prev => [data.asset, ...prev]);
      setShowAssetModal(false);
      
      toast({
        title: "Ativo enviado",`
        description: `Ativo ${data.asset.name} enviado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload do ativo",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DO ATIVO
   */
  const updateAssetStatus = async (assetId, newStatus) => {
    try {`
      const response = await fetch(`/api/dam/assets/${assetId}/status`, {
        method: 'PATCH',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do ativo');
      }

      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, status: newStatus, updatedAt: new Date().toISOString() }
          : asset
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status do ativo atualizado com sucesso",
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
   * FAVORITAR ATIVO
   */
  const favoriteAsset = async (assetId) => {
    try {`
      const response = await fetch(`/api/dam/assets/${assetId}/favorite`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao favoritar ativo');
      }

      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, isFavorite: !asset.isFavorite }
          : asset
      ));
      
      toast({
        title: "Ativo favoritado",
        description: "Ativo adicionado aos favoritos",
      });
    } catch (error) {
      console.error('Erro ao favoritar ativo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível favoritar o ativo",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR ATIVO
   */
  const renderAsset = (asset) => {
    const type = fileTypes[asset.type] || fileTypes.other;
    const status = assetStatuses[asset.status] || assetStatuses.draft;
    const access = accessLevels[asset.accessLevel] || accessLevels.internal;
    const collection = collections.find(c => c.id === asset.collectionId);
    
    return (
      <Card key={asset.id} className="hover:shadow-lg transition-shadow group">
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
            {asset.thumbnail ? (
              <img
                src={asset.thumbnail}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {type.icon && React.cloneElement(type.icon, { className: "h-16 w-16 text-gray-400" })}
              </div>
            )}
          </div>
          
          <div className="absolute top-2 left-2">
            <Badge className={type.color}>
              {type.icon}
              <span className="ml-1">{type.name}</span>
            </Badge>
          </div>
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge className={status.color}>
              {status.icon}
            </Badge>
            <Badge className={access.color}>
              {access.icon}
            </Badge>
          </div>
          
          <div className="absolute bottom-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick=({ ( }) => favoriteAsset(asset.id)}`
              className={`h-8 w-8 p-0 ${asset.isFavorite ? 'text-red-600' : 'text-gray-400'}`}
            >`
              <Heart className={`h-4 w-4 ${asset.isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">{asset.name}</h3>
            <p className="text-xs text-gray-600 line-clamp-1">{asset.description}</p>
          </div>
          
          <div className="space-y-1 mb-3 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Tamanho:</span>`
              <span>{asset.fileSize ? `${(asset.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Formato:</span>
              <span>{asset.format || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Criado:</span>
              <span>{new Date(asset.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Autor:</span>
              <span>{asset.author || 'Desconhecido'}</span>
            </div>
          </div>
          
          {/* Tags */}
          ({ asset.tags && asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {asset.tags.slice(0, 2).map((tag, index }) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {asset.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{asset.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-1 bg-gray-50 rounded">
              <div className="text-sm font-bold text-blue-600">{asset.views || 0}</div>
              <div className="text-xs text-gray-600">Views</div>
            </div>
            <div className="text-center p-1 bg-gray-50 rounded">
              <div className="text-sm font-bold text-green-600">{asset.downloads || 0}</div>
              <div className="text-xs text-gray-600">Downloads</div>
            </div>
            <div className="text-center p-1 bg-gray-50 rounded">
              <div className="text-sm font-bold text-purple-600">{asset.versions || 1}</div>
              <div className="text-xs text-gray-600">Versões</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Download className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Share className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex gap-1">
              <select
                value={asset.status}
                onChange=({ (e }) => updateAssetStatus(asset.id, e.target.value)}
                className="text-xs px-1 py-0.5 border border-gray-300 rounded"
              >
                ({ Object.entries(assetStatuses).map(([key, status] }) => (
                  <option key={key} value={key}>{status.name}</option>
                ))}
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick=({ ( }) => setSelectedAsset(asset)}
                className="h-6 w-6 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR COLEÇÃO
   */
  const renderCollection = (collection) => ({ const collectionAssets = assets.filter(a => a.collectionId === collection.id);
    const totalSize = collectionAssets.reduce((sum, a }) => sum + (a.fileSize || 0), 0);
    
    return (
      <Card key={collection.id} className="hover:shadow-md transition-shadow">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white">
              {collectionAssets.length} itens
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{collection.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{collection.description}</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Criada em:</span>
              <span>{new Date(collection.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tamanho total:</span>
              <span>{(totalSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Proprietário:</span>
              <span>{collection.owner || 'Sistema'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            ({ Object.entries(fileTypes).map(([key, type] }) => {
              const count = collectionAssets.filter(a => a.type === key).length;
              return (
                <div key={key} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-bold text-blue-600">{count}</div>
                  <div className="text-xs text-gray-600">{type.name}</div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Ativos
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />

            <Button variant="outline" size="sm">
              <Share className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => ({ const totalAssets = assets.length;
    const totalSize = assets.reduce((sum, a) => sum + (a.fileSize || 0), 0);
    const totalCollections = collections.length;
    const totalTags = tags.length;
    const publishedAssets = assets.filter(a => a.status === 'published').length;
    const favoriteAssets = assets.filter(a => a.isFavorite).length;
    const totalDownloads = assets.reduce((sum, a) => sum + (a.downloads || 0), 0);
    const totalViews = assets.reduce((sum, a }) => sum + (a.views || 0), 0);
    
    return { 
      totalAssets, 
      totalSize, 
      totalCollections, 
      totalTags, 
      publishedAssets, 
      favoriteAssets, 
      totalDownloads, 
      totalViews 
    };
  };

  const stats = getStats();

  /**
   * FILTRAR ATIVOS
   */
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filters.type === 'all' || asset.type === filters.type;
    const matchesCollection = filters.collection === 'all' || asset.collectionId === filters.collection;
    const matchesStatus = filters.status === 'all' || asset.status === filters.status;
    const matchesAuthor = filters.author === 'all' || asset.authorId === filters.author;
    const matchesTag = filters.tag === 'all' || asset.tags?.includes(filters.tag);
    
    return matchesSearch && matchesType && matchesCollection && matchesStatus && matchesAuthor && matchesTag;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadDAMData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <HardDrive className="h-8 w-8 text-blue-600" />
                Digital Asset Management
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de gestão de ativos digitais
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadDAMData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowCollectionModal(true)}
              >
                <Folder className="h-4 w-4 mr-2" />
                Nova Coleção
              </Button>
              <Button
                onClick=({ ( }) => setShowAssetModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Ativo
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
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
                  <p className="text-xs text-gray-500">{stats.publishedAssets} publicados</p>
                </div>
                <Image className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Armazenamento</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(stats.totalSize / 1024 / 1024 / 1024).toFixed(1)} GB
                  </p>
                  <p className="text-xs text-gray-500">{stats.totalCollections} coleções</p>
                </div>
                <HardDrive className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalDownloads.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stats.totalViews.toLocaleString()} visualizações</p>
                </div>
                <Download className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favoritos</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.favoriteAssets}</p>
                  <p className="text-xs text-gray-500">{stats.totalTags} tags</p>
                </div>
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do DAM */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assets">Ativos</TabsTrigger>
            <TabsTrigger value="collections">Coleções</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar ativos..."
                        value={searchTerm}
                        onChange=({ (e }) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.type}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Tipos</option>
                      ({ Object.entries(fileTypes).map(([key, type] }) => (
                        <option key={key} value={key}>{type.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.collection}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, collection: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Coleções</option>
                      {collections.map(collection => (
                        <option key={collection.id} value={collection.id}>{collection.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.status}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      ({ Object.entries(assetStatuses).map(([key, status] }) => (
                        <option key={key} value={key}>{status.name}</option>
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

            {/* Lista de Ativos */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando ativos...</span>
              </div>
            ) : filteredAssets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum ativo encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece fazendo upload do seu primeiro ativo digital
                  </p>
                  <Button onClick={( }) => setShowAssetModal(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Ativo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'}
              }>
                {filteredAssets.map(renderAsset)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            {/* Lista de Coleções */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando coleções...</span>
              </div>
            ) : collections.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma coleção encontrada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crie coleções para organizar seus ativos digitais
                  </p>
                  <Button onClick={( }) => setShowCollectionModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Coleção
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map(renderCollection)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workflows">
            <Card>
              <CardContent className="p-12 text-center">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Workflows de Aprovação
                </h3>
                <p className="text-gray-500">
                  Sistema de workflows para aprovação de ativos será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics de Ativos
                </h3>
                <p className="text-gray-500">
                  Relatórios e analytics de uso de ativos serão implementados aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showAssetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Upload de Ativo</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick=({ ( }) => setShowAssetModal(false)}>

                <Button disabled={loading}>
                  {loading ? 'Enviando...' : 'Fazer Upload'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalAssetManagement;
`