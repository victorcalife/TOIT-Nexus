import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, CreditCard, AlertCircle, Lock } from "lucide-react";
import { StandardHeader } from "@/components/standard-header";
import { useToast } from "@/hooks/use-toast";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

export default function VerifyCard()
{
  const [ cardData, setCardData ] = useState( {
    cardNumber,
    expiryMonth,
    expiryYear,
    cvc,
    cardholderName);
  const [ userId, setUserId ] = useState( '' );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ isVerified, setIsVerified ] = useState( false );
  const [ setupIntentId, setSetupIntentId ] = useState( '' );
  const [ validationErrors, setValidationErrors ] = useState<string[]>( [] );
  const { toast } = useToast();

  useEffect( () =>
  {
    const urlParams = new URLSearchParams( window.location.search );
    const userIdParam = urlParams.get( 'userId' );

    if ( userIdParam )
    {
      setUserId( userIdParam );
    } else
    {
      toast( {
        title,
        description,
        variant,
      } );
    }
  }, [] );

  const handleInputChange = ( e) =>
  {
    const { name, value } = e.target;

    let formattedValue = value;

    if ( name === 'cardNumber' )
    {
      formattedValue = value.replace( /\D/g, '' ).slice( 0, 19 );
      formattedValue = formattedValue.replace( /(\d{4})(?=\d)/g, '$1 ' );
    } else if ( name === 'expiryMonth' )
    {
      formattedValue = value.replace( /\D/g, '' ).slice( 0, 2 );
    } else if ( name === 'expiryYear' )
    {
      formattedValue = value.replace( /\D/g, '' ).slice( 0, 4 );
    } else if ( name === 'cvc' )
    {
      formattedValue = value.replace( /\D/g, '' ).slice( 0, 4 );
    } else if ( name === 'cardholderName' )
    {
      formattedValue = value.replace( /[^a-zA-Z\s]/g, '' ).slice( 0, 50 ).toUpperCase();
    }

    setCardData( prev => ( {
      ...prev,
      [ name ]: formattedValue
    } ) );

    if ( validationErrors.length > 0 )
    {
      setValidationErrors( [] );
    }
  };

  const validateCardData = async () =>
  {
    try
    {
      const response = await fetch( '/api/card-verification/validate-data', {
        method,
        headers,
        },
        body, '' ),
          expiryMonth),
          expiryYear),
          cvc,
          cardholderName),
      } );

      const result = await response.json();

      if ( !result.valid )
      {
        setValidationErrors( result.errors || [ 'Dados do cartão inválidos' ] );
        return false;
      }

      return true;
    } catch ( error )
    {
      console.error( 'Erro na validação, error );
      setValidationErrors( [ 'Erro ao validar dados do cartão' ] );
      return false;
    }
  };

  const createSetupIntent = async () =>
  {
    try
    {
      const response = await fetch( '/api/card-verification/create-intent', {
        method,
        headers,
        },
        body),
      } );

      const result = await response.json();

      if ( result.success )
      {
        setSetupIntentId( result.setupIntentId );
        return true;
      } else
      {
        toast( {
          title,
          description,
          variant,
        } );
        return false;
      }
    } catch ( error )
    {
      console.error( 'Erro ao criar Setup Intent, error );
      toast( {
        title,
        description,
        variant,
      } );
      return false;
    }
  };

  const handleSubmit = async ( e) =>
  {
    e.preventDefault();

    if ( !userId )
    {
      toast( {
        title,
        description,
        variant,
      } );
      return;
    }

    setIsLoading( true );
    setValidationErrors( [] );

    try
    {
      // 1. Validar dados do cartão
      const isValid = await validateCardData();
      if ( !isValid )
      {
        setIsLoading( false );
        return;
      }

      // 2. Criar Setup Intent
      const intentCreated = await createSetupIntent();
      if ( !intentCreated )
      {
        setIsLoading( false );
        return;
      }

      // 3. Simular processamento do cartão (em produção, usar Stripe Elements)
      setTimeout( async () =>
      {
        try
        {
          // Simular verificação bem-sucedida para desenvolvimento
          setIsVerified( true );
          toast( {
            title,
            description,
          } );

          // Redirecionar após 3 segundos
          setTimeout( () =>
          {
            window.location.href = `/verify-email?userId=${ userId }`;
          }, 3000 );

        } catch ( error )
        {
          console.error( 'Erro na verificação, error );
          toast( {
            title,
            description,
            variant,
          } );
        } finally
        {
          setIsLoading( false );
        }
      }, 2000 );

    } catch ( error )
    {
      console.error( 'Erro no processamento, error );
      toast( {
        title,
        description,
        variant,
      } );
      setIsLoading( false );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StandardHeader showLoginButton={false} />

      <div className="flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
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
                ) {`text-2xl font-semibold ${ isVerified ? 'text-green-600' : 'text-blue-600' }`}>
                {isVerified ? "Cartão verificado!" : "Validar cartão de crédito"}
              </CardTitle>

              <CardDescription className="text-center">
                {isVerified ? (
                  "Seu cartão foi validado com sucesso! Redirecionando..."
                ) {!isVerified ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do cartão</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={23}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Nome do portador</Label>
                    <Input
                      id="cardholderName"
                      name="cardholderName"
                      type="text"
                      placeholder="NOME COMO NO CARTÃO"
                      value={cardData.cardholderName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Mês</Label>
                      <Input
                        id="expiryMonth"
                        name="expiryMonth"
                        type="text"
                        placeholder="MM"
                        value={cardData.expiryMonth}
                        onChange={handleInputChange}
                        maxLength={2}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Ano</Label>
                      <Input
                        id="expiryYear"
                        name="expiryYear"
                        type="text"
                        placeholder="AAAA"
                        value={cardData.expiryYear}
                        onChange={handleInputChange}
                        maxLength={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        name="cvc"
                        type="text"
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={handleInputChange}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {validationErrors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-red-800 font-medium">Erros encontrados, index ) => (
                          <li key={index}>• {error}</li>
                        ) )}
                      </ul>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-blue-500" />
                      <p className="text-blue-800 text-sm">
                        <strong>Seguro) {!isVerified && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="text-sm"
                  >
                    Voltar ao Início
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              🎁 <strong>Trial de 7 dias gratuito!</strong><br />
              Validamos apenas se o cartão está ativo. Sem cobrança inicial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}