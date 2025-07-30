import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';

export function NotificationDemo() {
  const { addNotification } = useNotifications();

  const sendSuccessNotification = () => {
    addNotification({
      type: 'success',
      title: 'Operação Concluída',
      message: 'Sua ação foi executada com sucesso!',
      duration: 4000
    });
  };

  const sendErrorNotification = () => {
    addNotification({
      type: 'error',
      title: 'Erro na Operação',
      message: 'Ocorreu um problema ao executar a ação. Tente novamente.',
      duration: 6000
    });
  };

  const sendWarningNotification = () => {
    addNotification({
      type: 'warning',
      title: 'Atenção Necessária',
      message: 'Esta ação pode ter consequências. Deseja continuar?',
      action: {
        label: 'Continuar',
        onClick: () => {
          addNotification({
            type: 'info',
            title: 'Ação Confirmada',
            message: 'Continuando com a operação...',
            duration: 3000
          });
        }
      }
    });
  };

  const sendInfoNotification = () => {
    addNotification({
      type: 'info',
      title: 'Nova Funcionalidade',
      message: 'O sistema de notificações em tempo real está ativo! Experimente as diferentes opções.',
      duration: 5000
    });
  };

  const sendWorkflowNotification = () => {
    addNotification({
      type: 'success',
      title: 'Workflow Executado',
      message: 'O workflow "Processamento de Clientes" foi concluído com sucesso. 25 registros processados.',
      action: {
        label: 'Ver Detalhes',
        onClick: () => {
          console.log('Redirecionando para detalhes do workflow...');
        }
      }
    });
  };

  const sendPersistentNotification = () => {
    addNotification({
      type: 'warning',
      title: 'Backup Necessário',
      message: 'É recomendado fazer backup dos dados antes de continuar com a migração.',
      // No duration = persistent notification
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Sistema de Notificações</CardTitle>
        <CardDescription>
          Teste as diferentes tipos de notificações em tempo real com animações sutis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={sendSuccessNotification}
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            Sucesso
          </Button>
          
          <Button 
            onClick={sendErrorNotification}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Erro
          </Button>
          
          <Button 
            onClick={sendWarningNotification}
            variant="outline"
            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
          >
            Aviso
          </Button>
          
          <Button 
            onClick={sendInfoNotification}
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Informação
          </Button>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={sendWorkflowNotification}
            variant="outline"
            className="w-full"
          >
            Notificação de Workflow
          </Button>
          
          <Button 
            onClick={sendPersistentNotification}
            variant="outline"
            className="w-full"
          >
            Notificação Persistente
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
          <p><strong>Recursos:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Notificações toast com auto-dismiss</li>
            <li>Sino de notificações no header com contador</li>
            <li>Animações sutis de entrada e saída</li>
            <li>Ações personalizadas em notificações</li>
            <li>Diferentes tipos visuais (sucesso, erro, aviso, info)</li>
            <li>Conexão WebSocket para notificações em tempo real</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}