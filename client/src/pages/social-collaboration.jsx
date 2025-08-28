/**
 * SISTEMA SOCIAL COLLABORATION COMPLETO - TOIT NEXUS
 * Sistema completo de colaboração social empresarial
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
  Users, 
  MessageSquare,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share,
  Bookmark,
  Star,
  Flag,
  Hash,
  AtSign,
  Globe,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  MapPin,
  Building,
  Briefcase,
  Mail,
  Phone,
  Link,
  ExternalLink,
  Image,
  Video,
  FileText,
  Paperclip,
  Mic,
  Camera,
  Smile,
  Send,
  Edit,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Plus,
  Minus,
  Search,
  Filter,
  Settings,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Upload,
  Archive,
  Pin,
  PinOff,
  Copy,
  Move,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Activity,
  Target,
  Award,
  Trophy,
  Medal,
  Zap,
  Lightning,
  Flame,
  Coffee,
  PartyPopper }
} from 'lucide-react';

const SocialCollaboration = () => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    group: 'all',
    author: 'all',
    timeframe: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  
  const { toast } = useToast();

  // Tipos de post
  const postTypes = {
    text: { name: 'Texto', color: 'text-blue-600 bg-blue-100', icon: <MessageSquare className="h-3 w-3" /> },
    image: { name: 'Imagem', color: 'text-green-600 bg-green-100', icon: <Image className="h-3 w-3" /> },
    video: { name: 'Vídeo', color: 'text-purple-600 bg-purple-100', icon: <Video className="h-3 w-3" /> },
    document: { name: 'Documento', color: 'text-orange-600 bg-orange-100', icon: <FileText className="h-3 w-3" /> },
    poll: { name: 'Enquete', color: 'text-pink-600 bg-pink-100', icon: <Target className="h-3 w-3" /> },
    event: { name: 'Evento', color: 'text-indigo-600 bg-indigo-100', icon: <Calendar className="h-3 w-3" /> }
  };

  // Status dos grupos
  const groupStatuses = {
    public: { name: 'Público', color: 'text-green-600 bg-green-100', icon: <Globe className="h-3 w-3" /> },
    private: { name: 'Privado', color: 'text-orange-600 bg-orange-100', icon: <Lock className="h-3 w-3" /> },
    secret: { name: 'Secreto', color: 'text-red-600 bg-red-100', icon: <EyeOff className="h-3 w-3" /> }
  };

  /**
   * CARREGAR DADOS DA COLABORAÇÃO SOCIAL
   */
  const loadSocialData = async () => {
    setLoading(true);
    try {
      const [postsRes, groupsRes, eventsRes, discussionsRes, pollsRes, announcementsRes, connectionsRes] = await Promise.all([
        fetch('/api/social/posts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/groups', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/events', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/discussions', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/polls', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/announcements', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/connections', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData.groups || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }

      if (discussionsRes.ok) {
        const discussionsData = await discussionsRes.json();
        setDiscussions(discussionsData.discussions || []);
      }

      if (pollsRes.ok) {
        const pollsData = await pollsRes.json();
        setPolls(pollsData.polls || []);
      }

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData.announcements || []);
      }

      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData.connections || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados sociais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados sociais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR POST
   */
  const createPost = async (postData) => {
    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...postData,
          createdAt: new Date().toISOString(),`
          postId: `POST-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar post');
      }

      const data = await response.json();
      setPosts(prev => [data.post, ...prev]);
      setNewPostContent('');
      setShowPostModal(false);
      
      toast({
        title: "Post criado",
        description: "Post publicado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o post",
        variant: "destructive"
      });
    }
  };

  /**
   * CURTIR POST
   */
  const likePost = async (postId) => {
    try {`
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao curtir post');
      }

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: (post.likes || 0) + 1, isLiked: true }
          : post
      ));
      
      toast({
        title: "Post curtido",
        description: "Você curtiu este post",
      });
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir o post",
        variant: "destructive"
      });
    }
  };

  /**
   * COMENTAR POST
   */
  const commentPost = async (postId, commentData) => {
    try {`
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...commentData,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao comentar post');
      }

      const data = await response.json();
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments: [...(post.comments || []), data.comment],
              commentCount: (post.commentCount || 0) + 1
            }
          : post
      ));
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado",
      });
    } catch (error) {
      console.error('Erro ao comentar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR POST
   */
  const renderPost = (post) => {
    const type = postTypes[post.type] || postTypes.text;
    const group = groups.find(g => g.id === post.groupId);
    
    return (
      <Card key={post.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          {/* Header do Post */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">
                  {post.authorName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h4 className="font-medium">{post.authorName || 'Usuário'}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{new Date(post.createdAt).toLocaleString('pt-BR')}</span>
                  {group && (
                    <>
                      <span>•</span>
                      <span>{group.name}</span>
                    </>
                  )}
                  <Badge className={type.color}>
                    {type.icon}
                    <span className="ml-1">{type.name}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo do Post */}
          <div className="mb-4">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            
            {post.image && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt="Post image"
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}
            
            ({ post.attachments && post.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {post.attachments.map((attachment, index }) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Paperclip className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{attachment.name}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações do Post */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick=({ ( }) => likePost(post.id)}
                className={post.isLiked ? 'text-red-600' : ''}
              >`
                <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                {post.likes || 0}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick=({ ( }) => {
                  // Implementar comentários
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.commentCount || 0}
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-1" />

            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comentários */}
          ({ post.comments && post.comments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-3">
                {post.comments.slice(0, 3).map((comment, index }) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="font-medium text-sm">{comment.authorName}</div>
                        <div className="text-sm text-gray-700">{comment.content}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {post.comments.length > 3 && (
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Ver mais {post.comments.length - 3} comentários
                  </Button>
                )}
              </div>
              
              {/* Campo de novo comentário */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs text-blue-600">V</span>
                </div>
                <Input
                  placeholder="Escreva um comentário..."
                  className="flex-1"
                  onKeyPress=({ (e }) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      commentPost(post.id, { content: e.target.value.trim() });
                      e.target.value = '';
                    }
                  }}
                />
                <Button variant="ghost" size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR GRUPO
   */
  const renderGroup = (group) => {
    const status = groupStatuses[group.privacy] || groupStatuses.public;
    const memberCount = group.memberCount || 0;
    const postCount = posts.filter(p => p.groupId === group.id).length;
    
    return (
      <Card key={group.id} className="hover:shadow-md transition-shadow">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
          <div className="absolute top-4 right-4">
            <Badge className={status.color}>
              {status.icon}
              <span className="ml-1">{status.name}</span>
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{group.description}</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {memberCount} membros
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {postCount} posts
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Criado em {new Date(group.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
          
          <div className="flex gap-2">
            {group.isMember ? (
              <Button variant="outline" size="sm">
                <UserCheck className="h-3 w-3 mr-1" />

            ) : (
              <Button variant="default" size="sm">
                <UserPlus className="h-3 w-3 mr-1" />

            )}
            
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Grupo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR EVENTO
   */
  const renderEvent = (event) => {
    const isUpcoming = new Date(event.startDate) > new Date();
    const attendeeCount = event.attendeeCount || 0;
    
    return (
      <Card key={event.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
            </div>
            <Badge variant={isUpcoming ? 'default' : 'secondary'}>
              {isUpcoming ? 'Próximo' : 'Passado'}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(event.startDate).toLocaleDateString('pt-BR')} às {new Date(event.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location || 'Online'}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {attendeeCount} participantes
            </div>
          </div>
          
          <div className="flex gap-2">
            {event.isAttending ? (
              <Button variant="outline" size="sm">
                <UserCheck className="h-3 w-3 mr-1" />

            ) : (
              <Button variant="default" size="sm">
                <UserPlus className="h-3 w-3 mr-1" />

            )}
            
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            
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
  const getStats = () => ({ const totalPosts = posts.length;
    const totalGroups = groups.length;
    const totalEvents = events.length;
    const totalConnections = connections.length;
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = posts.reduce((sum, post }) => sum + (post.commentCount || 0), 0);
    const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).length;
    const activeDiscussions = discussions.filter(d => d.status === 'active').length;
    
    return { 
      totalPosts, 
      totalGroups, 
      totalEvents, 
      totalConnections, 
      totalLikes, 
      totalComments, 
      upcomingEvents, 
      activeDiscussions 
    };
  };

  const stats = getStats();

  /**
   * FILTRAR POSTS
   */
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || post.type === filters.type;
    const matchesGroup = filters.group === 'all' || post.groupId === filters.group;
    const matchesAuthor = filters.author === 'all' || post.authorId === filters.author;
    
    return matchesSearch && matchesType && matchesGroup && matchesAuthor;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadSocialData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Social Collaboration
              </h1>
              <p className="text-gray-600 mt-2">
                Plataforma de colaboração social empresarial
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadSocialData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowGroupModal(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Criar Grupo
              </Button>
              <Button
                onClick=({ ( }) => setShowPostModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Post
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
                  <p className="text-sm font-medium text-gray-600">Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                  <p className="text-xs text-gray-500">{stats.totalLikes} curtidas</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Grupos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalGroups}</p>
                  <p className="text-xs text-gray-500">{stats.activeDiscussions} discussões ativas</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eventos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalEvents}</p>
                  <p className="text-xs text-gray-500">{stats.upcomingEvents} próximos</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conexões</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalConnections}</p>
                  <p className="text-xs text-gray-500">{stats.totalComments} comentários</p>
                </div>
                <UserPlus className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs da Colaboração Social */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="connections">Conexões</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Criar Post */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">V</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="O que você está pensando?"
                      value={newPostContent}
                      onChange=({ (e }) => setNewPostContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Image className="h-4 w-4 mr-1" />

                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4 mr-1" />
                          Vídeo
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Paperclip className="h-4 w-4 mr-1" />

                        <Button variant="ghost" size="sm">
                          <Target className="h-4 w-4 mr-1" />

                      </div>
                      <Button
                        onClick=({ ( }) => {
                          if (newPostContent.trim()) {
                            createPost({ content: newPostContent.trim(), type: 'text' });
                          }
                        }}
                        disabled={!newPostContent.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />

                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar posts..."
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
                      ({ Object.entries(postTypes).map(([key, type] }) => (
                        <option key={key} value={key}>{type.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.group}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, group: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Grupos</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed de Posts */}
            <div className="space-y-6">
              ({ loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Carregando posts...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum post encontrado
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Seja o primeiro a compartilhar algo interessante
                    </p>
                    <Button onClick={( }) => setShowPostModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map(renderPost)
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            {/* Lista de Grupos */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando grupos...</span>
              </div>
            ) : groups.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum grupo encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crie grupos para colaborar com sua equipe
                  </p>
                  <Button onClick={( }) => setShowGroupModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Grupo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(renderGroup)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {/* Lista de Eventos */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando eventos...</span>
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum evento encontrado
                  </h3>
                  <p className="text-gray-500">
                    Os eventos da empresa aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(renderEvent)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections">
            <Card>
              <CardContent className="p-12 text-center">
                <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Rede de Conexões
                </h3>
                <p className="text-gray-500">
                  Sistema de conexões e networking será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Post</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick=({ ( }) => setShowPostModal(false)}>

                <Button disabled={loading}>
                  {loading ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialCollaboration;
`