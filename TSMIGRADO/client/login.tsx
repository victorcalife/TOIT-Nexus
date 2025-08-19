import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Eye, EyeOff, ArrowLeft, Zap, Shield, Lock, Sparkles, ChevronRight, CheckCircle } from "lucide-react";
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
  const [ cpfError, setCpfError ] = useState( "" );
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

    // Validar CPF em tempo real
    if ( formatted.length === 14 )
    {
      const cleanedCpf = cleanCpf( formatted );
      if ( !validateCpf( cleanedCpf ) )
      {
        setCpfError( "CPF inválido" );
      } else
      {
        setCpfError( "" );
      }
    } else if ( formatted.length > 0 )
    {
      setCpfError( "" );
    }
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Efeitos de luz animados */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-ping"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">

          {/* Header com logo e título */}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
                <img
                  src={nexusLogo}
                  alt="TOIT NEXUS"
                  className="h-16 w-auto mx-auto filter brightness-0 invert"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                TOIT NEXUS
              </h1>
              <p className="text-blue-200/80 text-lg font-medium">
                Portal do Cliente
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-300/60">
                <Shield className="h-4 w-4" />
                <span>Acesso Seguro</span>
                <div className="w-1 h-1 bg-blue-300/60 rounded-full"></div>
                <Sparkles className="h-4 w-4" />
                <span>Tecnologia Quântica</span>
              </div>
            </div>
          </div>

          {/* Card de Login Premium */}
          <Card className="relative overflow-hidden border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
            {/* Borda gradiente animada */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl opacity-75"></div>
            <div className="absolute inset-[1px] bg-white/95 backdrop-blur-xl rounded-xl"></div>

            {/* Conteúdo do card */}
            <div className="relative z-10">
              <CardHeader className="text-center pb-8 pt-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50"></div>
                    <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Acesso Seguro
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg mt-2">
                  Entre com suas credenciais para acessar sua conta
                </CardDescription>

                {/* Indicadores de segurança */}
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Criptografia 256-bit</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Autenticação Segura</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Campo CPF Premium */}
                  <div className="space-y-3">
                    <Label htmlFor="cpf" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>CPF</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <Input
                        id="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={handleCpfChange}
                        maxLength={14}
                        className={`relative z-10 h-12 pl-4 pr-12 text-lg border-2 rounded-lg transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 ${ cpfError
                          ? 'border-red-500 bg-red-50 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-500 bg-white hover:border-gray-300'
                          }`}
                        required
                      />
                      {/* Indicador de validação */}
                      {cpf && !cpfError && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {cpfError && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span>{cpfError}</span>
                      </div>
                    )}
                  </div>

                  {/* Campo Senha Premium */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Senha</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={( e ) => setPassword( e.target.value )}
                        className="relative z-10 h-12 pl-4 pr-12 text-lg border-2 rounded-lg transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 border-gray-200 focus:border-blue-500 bg-white hover:border-gray-300"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        onClick={() => setShowPassword( !showPassword )}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Botão de Login Premium */}
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Autenticando...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5" />
                          <span>Acessar Portal</span>
                          <ChevronRight className="h-5 w-5" />
                        </>
                      )}
                    </div>
                  </Button>
                </form>

                {/* Footer do card */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="text-center space-y-4">
                    <Button
                      variant="ghost"
                      onClick={handleBackToHome}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar ao início
                    </Button>

                    {/* Links de ajuda */}
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <a href="#" className="hover:text-blue-600 transition-colors duration-200">Esqueci minha senha</a>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <a href="#" className="hover:text-blue-600 transition-colors duration-200">Suporte</a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div >
  );
}