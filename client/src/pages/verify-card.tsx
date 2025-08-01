import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, CreditCard, AlertCircle } from "lucide-react";
import { StandardHeader } from "@/components/standard-header";
import { useToast } from "@/hooks/use-toast";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

export default function VerifyCard() {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [accountActivated, setAccountActivated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('userId');

    if (userIdParam) {
      setUserId(userIdParam);
    }
  }, []);

  const formatCardNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    // Limita a 16 dígitos
    const limited = cleaned.slice(0, 16);
    // Adiciona espaços a cada 4 dígitos
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    // Limita a 4 dígitos (MMYY)
    const limited = cleaned.slice(0, 4);
    // Adiciona barra após 2 dígitos
    if (limited.length >= 2) {
      return limited.slice(0, 2) + '/' + limited.slice(2);
    }
    return limited;
  };

  const formatCVC = (value: string) => {
    // Apenas números, máximo 4 dígitos
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    switch (field) {
      case 'number':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiry':
        formattedValue = formatExpiry(value);
        break;
      case 'cvc':
        formattedValue = formatCVC(value);
        break;
      case 'name':
        formattedValue = value.toUpperCase();
        break;
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateCard = () => {
    const errors = [];
    
    // Validar número do cartão (16 dígitos)
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (cardNumber.length !== 16) {
      errors.push('Número do cartão deve ter 16 dígitos');
    }
    
    // Validar data de expiração
    const expiry = cardData.expiry.replace('/', '');
    if (expiry.length !== 4) {
      errors.push('Data de expiração inválida (MM/YY)');
    } else {
      const month = parseInt(expiry.slice(0, 2));
      const year = parseInt('20' + expiry.slice(2));
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      if (month < 1 || month > 12) {
        errors.push('Mês de expiração inválido');
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.push('Cartão expirado');
      }
    }
    
    // Validar CVC (3 ou 4 dígitos)
    if (cardData.cvc.length < 3 || cardData.cvc.length > 4) {
      errors.push('CVC deve ter 3 ou 4 dígitos');
    }
    
    // Validar nome
    if (cardData.name.trim().length < 2) {
      errors.push('Nome do portador é obrigatório');
    }
    
    return errors;
  };

  const handleVerifyCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Erro",
        description: "ID do usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    const validationErrors = validateCard();
    if (validationErrors.length > 0) {
      toast({
        title: "Dados inválidos",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/trial/verify-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          cardData: {
            number: cardData.number.replace(/\s/g, ''),
            expiry: cardData.expiry,
            cvc: cardData.cvc,
            name: cardData.name
          }
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsVerified(true);
        setAccountActivated(result.accountActivated);
        
        toast({
          title: "Cartão verificado!",
          description: result.accountActivated 
            ? "Sua conta foi ativada com sucesso!"
            : "Cartão verificado. Complete as outras verificações.",
        });

        // Redirecionar após 3 segundos
        setTimeout(() => {
          if (result.accountActivated) {
            window.location.href = '/login?verified=true&activated=true';
          } else {
            // Verificar se precisa verificar email ou telefone
            window.location.href = `/verify-email?userId=${userId}`;
          }
        }, 3000);

      } else {
        toast({
          title: "Erro na verificação",
          description: result.message || "Dados do cartão inválidos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível verificar o cartão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StandardHeader showLoginButton={false} />
      
      <div className="flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={workflowLogo} 
                alt="TOIT Workflow" 
                className="h-20 w-auto opacity-90"
              />
            </div>
            <p className="text-gray-600 mt-2">
              {isVerified ? "Cartão verificado!" : "Verificação de cartão"}
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                {isVerified ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <CreditCard className="h-16 w-16 text-blue-500" />
                )}
              </div>
              
              <CardTitle className={`text-2xl font-semibold ${isVerified ? 'text-green-600' : 'text-blue-600'}`}>
                {isVerified ? "Verificação concluída!" : "Dados do cartão"}
              </CardTitle>
              
              <CardDescription className="text-center">
                {isVerified ? (
                  accountActivated ? (
                    "Sua conta foi ativada com sucesso! Redirecionando..."
                  ) : (
                    "Cartão verificado. Complete as outras verificações."
                  )
                ) : (
                  "Digite os dados do seu cartão de crédito para ativar o trial de 7 dias"
                )}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!isVerified ? (
                <form onSubmit={handleVerifyCard} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número do cartão</Label>
                    <Input
                      id="number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      maxLength={19}
                      className="text-lg font-mono tracking-wider"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Validade</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => handleInputChange('expiry', e.target.value)}
                        maxLength={5}
                        className="text-lg font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={(e) => handleInputChange('cvc', e.target.value)}
                        maxLength={4}
                        className="text-lg font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do portador</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="NOME COMO ESTÁ NO CARTÃO"
                      value={cardData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-lg"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">💳 Verificação segura</p>
                        <p className="mt-1 text-blue-600">
                          Apenas verificamos se o cartão é válido. Nenhuma cobrança será feita agora.
                          O trial de 7 dias é gratuito.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-lg py-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verificando..." : "Verificar Cartão"}
                  </Button>

                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => window.location.href = '/'}
                      className="text-sm"
                    >
                      Voltar ao Início
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  {accountActivated ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">🎉 Conta totalmente ativada!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Redirecionando para login em 3 segundos...
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-medium">📧 Verificações pendentes</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Cartão verificado. Agora complete a verificação de email e telefone.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trial info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              🎁 <strong>Trial de 7 dias gratuito!</strong><br />
              Complete a verificação para acessar a plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}