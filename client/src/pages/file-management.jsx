/**
 * SISTEMA DE GESTÃO DE ARQUIVOS - TOIT NEXUS
 * Sistema completo de upload, processamento e gestão de arquivos
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  File, 
  Folder,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  Download,
  Trash2,
  Edit,
  Eye,
  Share,
  Copy,
  Move,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  FolderPlus,
  MoreHorizontal,
  Star,
  Clock,
  User,
  HardDrive,
  Cloud,
  Lock,
  Unlock,
  Tag,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Info,
  Zap,
  Scissors,
  Maximize2,
  Play,
  Pause
} from 'lucide-react';

const FileManagement = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    size: 'all',
    date: 'all'
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const { toast } = useToast();

  // Tipos de arquivo suportados
  const fileTypes = {
    image: {
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      icon: <Image className="h-5 w-5" />,
      color: 'text-green-600 bg-green-100'
    },
    video: {
      extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
      icon: <Video className="h-5 w-5" />,
      color: 'text-red-600 bg-red-100'
    },
    audio: {
      extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
      icon: <Music className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-100'
    },
    document: {
      extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
      icon: <FileText className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-100'
    },
    archive: {
      extensions: ['zip', 'rar', '7z', 'tar', 'gz'],
      icon: <Archive className="h-5 w-5" />,
      color: 'text-orange-600 bg-orange-100'
    },
    other: {
      extensions: [],
      icon: <File className="h-5 w-5" />,
      color: 'text-gray-600 bg-gray-100'
    }
  };

  /**
   * CARREGAR ARQUIVOS E PASTAS
   */
  const loadFiles = async (folderId = null) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files?folder=${folderId || ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar arquivos');
      }

      const data = await response.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
      setCurrentFolder(data.currentFolder || null);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os arquivos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * UPLOAD DE ARQUIVOS
   */
  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', currentFolder?.id || '');
      
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Erro ao fazer upload de ${file.name}`);
        }

        // Simular progresso (em produção seria via WebSocket ou Server-Sent Events)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress >= 100) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [file.name]: Math.min(currentProgress + 10, 100) };
          });
        }, 200);

        const data = await response.json();
        
        // Adicionar arquivo à lista
        setFiles(prev => [...prev, data.file]);
        
        toast({
          title: "Upload concluído",
          description: `${file.name} foi enviado com sucesso`,
        });
        
        // Limpar progresso após 2 segundos
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 2000);
        
      } catch (error) {
        console.error(`Erro no upload de ${file.name}:`, error);
        toast({
          title: "Erro no upload",
          description: `Não foi possível enviar ${file.name}`,
          variant: "destructive"
        });
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  };

  /**
   * CRIAR PASTA
   */
  const createFolder = async (folderName) => {
    try {
      const response = await fetch('/api/files/folder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          parentId: currentFolder?.id || null
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pasta');
      }

      const data = await response.json();
      setFolders(prev => [...prev, data.folder]);
      
      toast({
        title: "Pasta criada",
        description: `Pasta "${folderName}" criada com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a pasta",
        variant: "destructive"
      });
    }
  };

  /**
   * DELETAR ARQUIVOS/PASTAS
   */
  const deleteItems = async (itemIds, itemTypes) => {
    if (!confirm('Tem certeza que deseja deletar os itens selecionados?')) return;

    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemIds, itemTypes })
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar itens');
      }

      // Remover itens das listas
      setFiles(prev => prev.filter(file => !itemIds.includes(file.id)));
      setFolders(prev => prev.filter(folder => !itemIds.includes(folder.id)));
      setSelectedItems([]);
      
      toast({
        title: "Itens deletados",
        description: "Itens removidos com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar os itens",
        variant: "destructive"
      });
    }
  };

  /**
   * DOWNLOAD DE ARQUIVO
   */
  const downloadFile = async (file) => {
    try {
      const response = await fetch(`/api/files/${file.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer download');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download iniciado",
        description: `Download de ${file.name} iniciado`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o download",
        variant: "destructive"
      });
    }
  };

  /**
   * OBTER TIPO DE ARQUIVO
   */
  const getFileType = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    for (const [type, config] of Object.entries(fileTypes)) {
      if (config.extensions.includes(extension)) {
        return { type, ...config };
      }
    }
    
    return { type: 'other', ...fileTypes.other };
  };

  /**
   * FORMATAR TAMANHO DO ARQUIVO
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * PREVIEW DE ARQUIVO
   */
  const previewFile = (file) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  /**
   * DRAG & DROP
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  /**
   * RENDERIZAR ARQUIVO EM GRID
   */
  const renderFileGrid = (file) => {
    const fileType = getFileType(file.name);
    const isSelected = selectedItems.includes(file.id);
    
    return (
      <div
        key={file.id}
        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
        onClick={() => {
          if (isSelected) {
            setSelectedItems(prev => prev.filter(id => id !== file.id));
          } else {
            setSelectedItems(prev => [...prev, file.id]);
          }
        }}
        onDoubleClick={() => previewFile(file)}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-lg mb-3 ${fileType.color}`}>
            {fileType.icon}
          </div>
          
          <h4 className="font-medium text-sm mb-1 truncate w-full" title={file.name}>
            {file.name}
          </h4>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div>{formatFileSize(file.size)}</div>
            <div>{new Date(file.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
          
          {file.isProcessing && (
            <Badge variant="outline" className="mt-2 text-xs">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Processando
            </Badge>
          )}
          
          <div className="flex gap-1 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                previewFile(file);
              }}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(file);
              }}
              className="h-6 w-6 p-0"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Implementar compartilhamento
              }}
              className="h-6 w-6 p-0"
            >
              <Share className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * RENDERIZAR PASTA EM GRID
   */
  const renderFolderGrid = (folder) => {
    const isSelected = selectedItems.includes(folder.id);
    
    return (
      <div
        key={folder.id}
        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
        onClick={() => {
          if (isSelected) {
            setSelectedItems(prev => prev.filter(id => id !== folder.id));
          } else {
            setSelectedItems(prev => [...prev, folder.id]);
          }
        }}
        onDoubleClick={() => loadFiles(folder.id)}
      >
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-lg mb-3 text-yellow-600 bg-yellow-100">
            <Folder className="h-5 w-5" />
          </div>
          
          <h4 className="font-medium text-sm mb-1 truncate w-full" title={folder.name}>
            {folder.name}
          </h4>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div>{folder.fileCount || 0} arquivos</div>
            <div>{new Date(folder.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
          
          <div className="flex gap-1 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                loadFiles(folder.id);
              }}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Implementar renomear
              }}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * RENDERIZAR PREVIEW
   */
  const renderPreview = () => {
    if (!previewFile) return null;
    
    const fileType = getFileType(previewFile.name);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{previewFile.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreviewModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-4">
            {fileType.type === 'image' && (
              <img
                src={`/api/files/${previewFile.id}/preview`}
                alt={previewFile.name}
                className="max-w-full max-h-96 object-contain mx-auto"
              />
            )}
            
            {fileType.type === 'video' && (
              <video
                controls
                className="max-w-full max-h-96 mx-auto"
                src={`/api/files/${previewFile.id}/preview`}
              />
            )}
            
            {fileType.type === 'audio' && (
              <audio
                controls
                className="w-full"
                src={`/api/files/${previewFile.id}/preview`}
              />
            )}
            
            {fileType.type === 'document' && (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Preview não disponível para este tipo de arquivo</p>
                <Button
                  onClick={() => downloadFile(previewFile)}
                  className="mt-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Fazer Download
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tamanho:</span>
              <span className="ml-2 font-medium">{formatFileSize(previewFile.size)}</span>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <span className="ml-2 font-medium">{fileType.type}</span>
            </div>
            <div>
              <span className="text-gray-600">Criado em:</span>
              <span className="ml-2 font-medium">
                {new Date(previewFile.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Modificado em:</span>
              <span className="ml-2 font-medium">
                {new Date(previewFile.updatedAt).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button onClick={() => downloadFile(previewFile)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * FILTRAR ARQUIVOS
   */
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const fileType = getFileType(file.name);
    const matchesType = filters.type === 'all' || fileType.type === filters.type;
    
    return matchesSearch && matchesType;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadFiles();
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
                Gestão de Arquivos
              </h1>
              <p className="text-gray-600 mt-2">
                Upload, organize e gerencie seus arquivos
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const folderName = prompt('Nome da pasta:');
                  if (folderName) createFolder(folderName);
                }}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Pasta
              </Button>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        {currentFolder && (
          <div className="mb-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Button
                variant="link"
                size="sm"
                onClick={() => loadFiles()}
                className="p-0 h-auto"
              >
                Início
              </Button>
              <span>/</span>
              <span className="font-medium">{currentFolder.name}</span>
            </nav>
          </div>
        )}

        {/* Controles */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="image">Imagens</option>
                  <option value="video">Vídeos</option>
                  <option value="audio">Áudios</option>
                  <option value="document">Documentos</option>
                  <option value="archive">Arquivos</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selecionados
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Implementar download múltiplo
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteItems(selectedItems, ['file', 'folder'])}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Deletar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arraste arquivos aqui ou clique para fazer upload
            </p>
            <p className="text-gray-500">
              Suporte para imagens, vídeos, documentos e mais
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              Selecionar Arquivos
            </Button>
          </div>
        </div>

        {/* Progress de Upload */}
        {Object.keys(uploadProgress).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Upload em Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(uploadProgress).map(([filename, progress]) => (
                  <div key={filename}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">{filename}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Arquivos */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando arquivos...</span>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
            {/* Pastas */}
            {folders.map(renderFolderGrid)}
            
            {/* Arquivos */}
            {filteredFiles.map(renderFileGrid)}
            
            {folders.length === 0 && filteredFiles.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Pasta vazia
                </h3>
                <p className="text-gray-500">
                  Faça upload de arquivos ou crie uma nova pasta
                </p>
              </div>
            )}
          </div>
        )}

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => {
            if (e.target.files?.length > 0) {
              uploadFiles(e.target.files);
            }
          }}
          className="hidden"
        />

        {/* Modal de Preview */}
        {showPreviewModal && renderPreview()}
      </div>
    </div>
  );
};

export default FileManagement;
