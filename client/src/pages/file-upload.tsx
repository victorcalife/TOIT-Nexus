import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  File, 
  FileSpreadsheet, 
  Trash2, 
  Eye, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Database
} from 'lucide-react';

interface UploadedFile {
  id: string;
  originalName: string;
  fileSize: number;
  rowCount: number;
  status: string;
  createdAt: string;
  headers: string[];
  formattedSize: string;
  formattedDate: string;
}

interface FileData {
  id: string;
  originalName: string;
  headers: string[];
  rows: any[];
  totalRows: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
  totalRows: number;
  fileTypes: Record<string, number>;
  recentFiles: UploadedFile[];
}

export default function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para listar arquivos
  const { data: files = [], isLoading: filesLoading } = useQuery<UploadedFile[]>({
    queryKey: ['/api/files/list'],
    queryFn: async () => {
      const response = await fetch('/api/files/list');
      if (!response.ok) throw new Error('Erro ao buscar arquivos');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Query para estatísticas
  const { data: stats } = useQuery<FileStats>({
    queryKey: ['/api/files/stats'],
    queryFn: async () => {
      const response = await fetch('/api/files/stats');
      if (!response.ok) throw new Error('Erro ao buscar estatísticas');
      const result = await response.json();
      return result.data;
    }
  });

  // Query para preview de arquivo
  const { data: fileData, isLoading: previewLoading } = useQuery<FileData>({
    queryKey: ['/api/files', previewFileId, 'data', previewPage],
    queryFn: async () => {
      if (!previewFileId) return null;
      const limit = 20;
      const offset = (previewPage - 1) * limit;
      const response = await fetch(`/api/files/${previewFileId}/data?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error('Erro ao buscar dados do arquivo');
      const result = await response.json();
      return result.data;
    },
    enabled: !!previewFileId
  });

  // Mutation para upload
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro no upload');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload concluído!",
        description: `Arquivo processado: ${data.data.rowCount} linhas encontradas`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files/list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/files/stats'] });
      setSelectedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  // Mutation para deletar arquivo
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar arquivo');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Arquivo deletado",
        description: "Arquivo removido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files/list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/files/stats'] });
      setPreviewFileId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['.xls', '.xlsx', '.csv'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExt)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Apenas arquivos .xls, .xlsx e .csv são permitidos",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simular progresso
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    uploadMutation.mutate(selectedFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <File className="h-4 w-4 text-green-600" />;
    return <FileSpreadsheet className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Upload de Arquivos</h1>
        <p className="text-gray-600 mt-2">
          Envie arquivos Excel (.xls, .xlsx) e CSV para análise e processamento
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Arquivos</p>
                  <p className="text-2xl font-bold">{stats.totalFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Espaço Usado</p>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Linhas</p>
                  <p className="text-2xl font-bold">{stats.totalRows.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Tipos</p>
                  <div className="flex space-x-1 mt-1">
                    {Object.entries(stats.fileTypes).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Enviar Arquivo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">
                Clique para selecionar arquivo
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ou arraste e solte aqui
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Suportados: .xls, .xlsx, .csv (máx. 10MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Selected File */}
            {selectedFile && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      size="sm"
                    >
                      {isUploading ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processando arquivo...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Meus Arquivos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {filesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Carregando arquivos...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileSpreadsheet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>Nenhum arquivo enviado ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer ${
                        previewFileId === file.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setPreviewFileId(file.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.originalName)}
                        <div>
                          <p className="font-medium text-sm truncate max-w-48">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.formattedSize} • {file.rowCount} linhas • {file.formattedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFileId(previewFileId === file.id ? null : file.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(file.id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* File Preview */}
      {previewFileId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Preview do Arquivo</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewFileId(null)}
              >
                Fechar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Carregando dados...</p>
              </div>
            ) : fileData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      {fileData.totalRows} linhas total
                    </Badge>
                    <Badge variant="outline">
                      Página {fileData.currentPage} de {fileData.totalPages}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage <= 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewPage(previewPage + 1)}
                      disabled={!fileData.hasMore}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-96 w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {fileData.headers.map((header, index) => (
                          <TableHead key={index} className="whitespace-nowrap">
                            {header || `Coluna ${index + 1}`}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fileData.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {fileData.headers.map((header, colIndex) => (
                            <TableCell key={colIndex} className="whitespace-nowrap">
                              {row[header] || ''}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Erro ao carregar dados do arquivo</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}