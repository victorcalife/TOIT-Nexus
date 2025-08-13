import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Eye, EyeOff, ArrowLeft, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCpf, cleanCpf, validateCpf } from "@/lib/utils";
import nexusLogo from "@/assets/toit-nexus-logo.svg";

export default function Login()
{
  const [ cpf, setCpf ] = useState( "" );
  const [ password, setPassword ] = useState( "" );
  const [ showPassword, setShowPassword ] = useState( false );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ redirectUrl, setRedirectUrl ] = useState<string | null>( null );
  const { toast } = useToast();

  // Verificar parâmetro de redirecionamento na URL
  useEffect( () =>
  {
    const urlParams = new URLSearchParams( window.location.search );
    const redirect = urlParams.get( 'redirect' );
    if ( redirect )
    {
      setRedirectUrl( decodeURIComponent( redirect ) );
      console.log( '🔄 Redirecionamento detectado:', decodeURIComponent( redirect ) );
    }
  }, [] );

  const handleCpfChange = ( e: React.ChangeEvent<HTMLInputElement> ) =>
  {
    const formatted = formatCpf( e.target.value );
    setCpf( formatted );
  };

  const handleSubmit = async ( e: React.FormEvent ) =>
  {
    e.preventDefault();

    if ( !cpf || !password )
    {
      toast( {
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      } );
      return;
    }

    // Valida CPF antes de enviar
    if ( !validateCpf( cpf ) )
    {
      toast( {
        title: "CPF Inválido",
        description: "Por favor, digite um CPF válido.",
        variant: "destructive",
      } );
      return;
    }

    setIsLoading( true );

    try
    {
      const response = await fetch( '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( {
          cpf: cleanCpf( cpf ), // Remove formatting for API
          password,
          loginType: 'client' // Identificar como login de cliente
        } ),
        credentials: 'include'
      } );

      if ( response.ok )
      {
        const userData = await response.json();
        toast( {
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${ userData.firstName }!`,
        } );

        // Redirect based on redirect parameter or user role
        if ( redirectUrl )
        {
          console.log( '🔄 Redirecionando para URL solicitada:', redirectUrl );
          window.location.href = redirectUrl;
        } else if ( userData.role === 'super_admin' )
        {
          window.location.href = '/admin/dashboard';
        } else if ( userData.tenantId )
        {
          window.location.href = '/dashboard';
        } else
        {
          window.location.href = '/select-tenant';
        }
      } else
      {
        const errorData = await response.json();
        toast( {
          title: "Erro no login",
          description: errorData.message || "CPF ou senha incorretos.",
          variant: "destructive",
        } );
      }
    } catch ( error )
    {
      console.error( 'Login error:', error );
      toast( {
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      } );
    } finally
    {
      setIsLoading( false );
    }
  };

  const handleBackToHome = () =>
  {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={nexusLogo}
              alt="TOIT NEXUS"
              className="h-16 w-auto"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              TOIT NEXUS
            </h1>
            <p className="text-gray-600 mt-2">
              Portal do Cliente
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className="text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={( e ) => setPassword( e.target.value )}
                    className="text-lg pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword( !showPassword )}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-lg py-6"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Link para voltar */}
            <div className="text-center pt-4 border-t border-gray-200 mt-6">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para página inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}