/**
 * SISTEMA KNOWLEDGE MANAGEMENT COMPLETO - TOIT NEXUS
 * Sistema completo de gestão do conhecimento
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
  BookOpen, 
  Brain,
  Lightbulb,
  FileText,
  Folder,
  FolderOpen,
  Search,
  Filter,
  Tag,
  Hash,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  Share,
  Bookmark,
  Flag,
  User,
  Users,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Plus,
  Minus,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Archive,
  Copy,
  Move,
  Link,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Trophy,
  Medal,
  Zap,
  Globe,
  Lock,
  Unlock,
  Shield,
  Key,
  Database,
  Server,
  Cloud,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  BookMarked,
  Library,
  Newspaper,
  FileImage,
  FileVideo,
  FileAudio,
  FilePdf,
  FileSpreadsheet,
  FileCode,
  MessageSquare,
  Quote,
  List,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Hexagon }
} from 'lucide-react';

const KnowledgeManagement = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [wikis, setWikis] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    tag: 'all',
    author: 'all',
    status: 'all',
    type: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('articles');
  
  const { toast } = useToast();

  // Status dos artigos
  const articleStatuses = {
    draft: { name: 'Rascunho', color: 'text-gray-600 bg-gray-100', icon: <FileText className="h-3 w-3" /> },
    review: { name: 'Em Revisão', color: 'text-yellow-600 bg-yellow-100', icon: <Eye className="h-3 w-3" /> },
    published: { name: 'Publicado', color: 'text-green-600 bg-green-100', icon: <BookOpen className="h-3 w-3" /> },
    archived: { name: 'Arquivado', color: 'text-orange-600 bg-orange-100', icon: <Archive className="h-3 w-3" /> }
  };

  // Tipos de conteúdo
  const contentTypes = {
    article: { name: 'Artigo', color: 'text-blue-600 bg-blue-100', icon: <FileText className="h-3 w-3" /> },
    tutorial: { name: 'Tutorial', color: 'text-green-600 bg-green-100', icon: <GraduationCap className="h-3 w-3" /> },
    faq: { name: 'FAQ', color: 'text-purple-600 bg-purple-100', icon: <MessageSquare className="h-3 w-3" /> },
    wiki: { name: 'Wiki', color: 'text-orange-600 bg-orange-100', icon: <BookMarked className="h-3 w-3" /> },
    document: { name: 'Documento', color: 'text-red-600 bg-red-100', icon: <FileText className="h-3 w-3" /> },
    video: { name: 'Vídeo', color: 'text-pink-600 bg-pink-100', icon: <FileVideo className="h-3 w-3" /> }
  };

  // Níveis de dificuldade
  const difficultyLevels = {
    beginner: { name: 'Iniciante', color: 'text-green-600 bg-green-100' },
    intermediate: { name: 'Intermediário', color: 'text-yellow-600 bg-yellow-100' },
    advanced: { name: 'Avançado', color: 'text-orange-600 bg-orange-100' },
    expert: { name: 'Especialista', color: 'text-red-600 bg-red-100' }
  };

  /**
   * CARREGAR DADOS DO KNOWLEDGE MANAGEMENT
   */
  const loadKnowledgeData = async () => {
    setLoading(true);
    try {
      const [articlesRes, categoriesRes, tagsRes, wikisRes, faqsRes, tutorialsRes, documentsRes] = await Promise.all([
        fetch('/api/knowledge/articles', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/knowledge/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/knowledge/tags', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/knowledge/wikis', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/knowledge/faqs', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/knowledge/tutorials', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/knowledge/documents', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.tags || []);
      }

      if (wikisRes.ok) {
        const wikisData = await wikisRes.json();
        setWikis(wikisData.wikis || []);
      }

      if (faqsRes.ok) {
        const faqsData = await faqsRes.json();
        setFaqs(faqsData.faqs || []);
      }

      if (tutorialsRes.ok) {
        const tutorialsData = await tutorialsRes.json();
        setTutorials(tutorialsData.tutorials || []);
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json();
        setDocuments(documentsData.documents || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do knowledge management:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do knowledge management",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR ARTIGO
   */
  const createArticle = async (articleData) => {
    try {
      const response = await fetch('/api/knowledge/articles', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...articleData,
          status: 'draft',
          createdAt: new Date().toISOString(),`
          articleId: `ART-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar artigo');
      }

      const data = await response.json();
      setArticles(prev => [data.article, ...prev]);
      setShowArticleModal(false);
      
      toast({
        title: "Artigo criado",`
        description: `Artigo "${data.article.title}" criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar artigo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o artigo",
        variant: "destructive"
      });
    }
  };

  /**
   * PUBLICAR ARTIGO
   */
  const publishArticle = async (articleId) => {
    try {`
      const response = await fetch(`/api/knowledge/articles/${articleId}/publish`, {
        method: 'PATCH',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao publicar artigo');
      }

      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, status: 'published', publishedAt: new Date().toISOString() }
          : article
      ));
      
      toast({
        title: "Artigo publicado",
        description: "Artigo publicado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao publicar artigo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar o artigo",
        variant: "destructive"
      });
    }
  };

  /**
   * CURTIR ARTIGO
   */
  const likeArticle = async (articleId) => {
    try {`
      const response = await fetch(`/api/knowledge/articles/${articleId}/like`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao curtir artigo');
      }

      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, likes: (article.likes || 0) + 1, isLiked: true }
          : article
      ));
      
      toast({
        title: "Artigo curtido",
        description: "Você curtiu este artigo",
      });
    } catch (error) {
      console.error('Erro ao curtir artigo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir o artigo",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR CARD DE ARTIGO
   */
  const renderArticleCard = (article) => {
    const status = articleStatuses[article.status] || articleStatuses.draft;
    const type = contentTypes[article.type] || contentTypes.article;
    const category = categories.find(c => c.id === article.categoryId);
    const difficulty = difficultyLevels[article.difficulty] || difficultyLevels.beginner;
    
    return (
      <Card key={article.id} className="hover:shadow-lg transition-shadow group">
        <div className="relative">
          <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
            {article.thumbnail ? (
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="absolute top-2 left-2">
            <Badge className={type.color}>
              {type.icon}
              <span className="ml-1">{type.name}</span>
            </Badge>
          </div>
          
          <div className="absolute top-2 right-2">
            <Badge className={status.color}>
              {status.icon}
              <span className="ml-1">{status.name}</span>
            </Badge>
          </div>
          
          <div className="absolute bottom-2 left-2">
            <Badge className={difficulty.color}>
              {difficulty.name}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="mb-3">
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">{article.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {article.author || 'Autor desconhecido'}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {category ? category.name : 'Sem categoria'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(article.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {article.readTime || '5'} min de leitura
            </div>
          </div>
          
          {/* Tags */}
          ({ article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {article.tags.slice(0, 3).map((tag, index }) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{article.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{article.views || 0}</div>
              <div className="text-xs text-gray-600">Visualizações</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{article.likes || 0}</div>
              <div className="text-xs text-gray-600">Curtidas</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-purple-600">{article.comments || 0}</div>
              <div className="text-xs text-gray-600">Comentários</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick=({ ( }) => likeArticle(article.id)}
                className={article.isLiked ? 'text-red-600' : ''}
              >`
                <Heart className={`h-4 w-4 ${article.isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              ({ article.status === 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={( }) => publishArticle(article.id)}
                >
                  <BookOpen className="h-3 w-3 mr-1" />

              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick=({ ( }) => setSelectedArticle(article)}
              >
                <Eye className="h-3 w-3 mr-1" />

            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR CATEGORIA
   */
  const renderCategory = (category) => {
    const categoryArticles = articles.filter(a => a.categoryId === category.id);
    const publishedArticles = categoryArticles.filter(a => a.status === 'published').length;
    
    return (
      <Card key={category.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{categoryArticles.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{publishedArticles}</div>
              <div className="text-xs text-gray-600">Publicados</div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Criada em:</span>
              <span>{new Date(category.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última atualização:</span>
              <span>{new Date(category.updatedAt || category.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Artigos
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR FAQ
   */
  const renderFAQ = (faq) => {
    return (
      <Card key={faq.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{faq.answer}</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categoria: {faq.category || 'Geral'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(faq.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{faq.helpful || 0}</div>
              <div className="text-xs text-gray-600">Útil</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{faq.views || 0}</div>
              <div className="text-xs text-gray-600">Visualizações</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-1" />
                Ver Completa
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-3 w-3 mr-1" />

            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR TUTORIAL
   */
  const renderTutorial = (tutorial) => {
    const difficulty = difficultyLevels[tutorial.difficulty] || difficultyLevels.beginner;
    
    return (
      <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{tutorial.title}</h3>
                <Badge className={difficulty.color}>
                  {difficulty.name}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{tutorial.description}</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {tutorial.steps?.length || 0} passos
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {tutorial.duration || '30'} minutos
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {tutorial.author || 'Autor desconhecido'}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{tutorial.views || 0}</div>
              <div className="text-xs text-gray-600">Visualizações</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{tutorial.completed || 0}</div>
              <div className="text-xs text-gray-600">Concluídos</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-yellow-600">{tutorial.rating || 0}</div>
              <div className="text-xs text-gray-600">Avaliação</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              <Play className="h-3 w-3 mr-1" />
              Iniciar Tutorial
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />

            <Button variant="outline" size="sm">
              <Bookmark className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => ({ const totalArticles = articles.length;
    const publishedArticles = articles.filter(a => a.status === 'published').length;
    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalLikes = articles.reduce((sum, a }) => sum + (a.likes || 0), 0);
    const totalCategories = categories.length;
    const totalTutorials = tutorials.length;
    const totalFAQs = faqs.length;
    const totalWikis = wikis.length;
    
    return { 
      totalArticles, 
      publishedArticles, 
      totalViews, 
      totalLikes, 
      totalCategories, 
      totalTutorials, 
      totalFAQs, 
      totalWikis 
    };
  };

  const stats = getStats();

  /**
   * FILTRAR ARTIGOS
   */
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filters.category === 'all' || article.categoryId === filters.category;
    const matchesTag = filters.tag === 'all' || article.tags?.includes(filters.tag);
    const matchesAuthor = filters.author === 'all' || article.authorId === filters.author;
    const matchesStatus = filters.status === 'all' || article.status === filters.status;
    const matchesType = filters.type === 'all' || article.type === filters.type;
    
    return matchesSearch && matchesCategory && matchesTag && matchesAuthor && matchesStatus && matchesType;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadKnowledgeData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Brain className="h-8 w-8 text-blue-600" />
                Knowledge Management
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de gestão do conhecimento
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadKnowledgeData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowWikiModal(true)}
              >
                <BookMarked className="h-4 w-4 mr-2" />
                Nova Wiki
              </Button>
              <Button
                onClick=({ ( }) => setShowArticleModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Artigo
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
                  <p className="text-sm font-medium text-gray-600">Artigos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
                  <p className="text-xs text-gray-500">{stats.publishedArticles} publicados</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visualizações</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stats.totalLikes} curtidas</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tutoriais</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalTutorials}</p>
                  <p className="text-xs text-gray-500">{stats.totalFAQs} FAQs</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categorias</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalCategories}</p>
                  <p className="text-xs text-gray-500">{stats.totalWikis} wikis</p>
                </div>
                <Folder className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do Knowledge Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="articles">Artigos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="tutorials">Tutoriais</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="wikis">Wikis</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar artigos..."
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
                      value={filters.status}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      ({ Object.entries(articleStatuses).map(([key, status] }) => (
                        <option key={key} value={key}>{status.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.type}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Tipos</option>
                      ({ Object.entries(contentTypes).map(([key, type] }) => (
                        <option key={key} value={key}>{type.name}</option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick=({ ( }) => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Artigos */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando artigos...</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum artigo encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece criando seu primeiro artigo de conhecimento
                  </p>
                  <Button onClick={( }) => setShowArticleModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Artigo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'}
              }>
                {filteredArticles.map(renderArticleCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {/* Lista de Categorias */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando categorias...</span>
              </div>
            ) : categories.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma categoria encontrada
                  </h3>
                  <p className="text-gray-500">
                    Crie categorias para organizar seu conhecimento
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(renderCategory)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            {/* Lista de Tutoriais */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando tutoriais...</span>
              </div>
            ) : tutorials.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum tutorial encontrado
                  </h3>
                  <p className="text-gray-500">
                    Crie tutoriais para ensinar processos e procedimentos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map(renderTutorial)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="faqs" className="space-y-6">
            {/* Lista de FAQs */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando FAQs...</span>
              </div>
            ) : faqs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma FAQ encontrada
                  </h3>
                  <p className="text-gray-500">
                    Crie perguntas frequentes para esclarecer dúvidas comuns
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map(renderFAQ)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="wikis">
            <Card>
              <CardContent className="p-12 text-center">
                <BookMarked className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sistema de Wikis
                </h3>
                <p className="text-gray-500">
                  Sistema colaborativo de wikis será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showArticleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Artigo</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick=({ ( }) => setShowArticleModal(false)}>

                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Artigo'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeManagement;
`