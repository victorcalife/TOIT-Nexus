import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User, Sparkles, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCpf, cleanCpf, validateCpf } from "@/lib/utils";
import nexusLogo from "@/assets/toit-nexus-logo.svg";

export default function Login()
{
  const [ cpf, setCpf ] = useState( "" );
  const [ password, setPassword ] = useState( "" );
  const [ showPassword, setShowPassword ] = useState( false );
  const [ isLoading, setIsLoading ] = useState( false );
  const { toast } = useToast();

  const handleCpfChange = ( e ) =>
  {
    const formatted = formatCpf( e.target.value );
    setCpf( formatted );
  };

  const handleSubmit = async ( e ) =>
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
        title: "Erro",
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
        } ),
      } );

      if ( response.ok )
      {
        const userData = await response.json();
        toast( {
          title: "Sucesso",
          description: `Bem-vindo, ${ userData.user?.name || 'Usuário' }!`,
        } );

        // Redirect based on user role
        if ( userData.user?.role === 'super_admin' )
        {
          window.location.href = '/admin/dashboard';
        } else if ( userData.user?.tenantId )
        {
          window.location.href = '/dashboard';
        } else
        {
          window.location.href = '/dashboard';
        }
      } else
      {
        const errorData = await response.json();
        toast( {
          title: "Erro de Login",
          description: errorData.message || "Credenciais inválidas",
          variant: "destructive",
        } );
      }
    } catch ( error )
    {
      console.error( 'Login error:', error );
      toast( {
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      } );
    } finally
    {
      setIsLoading( false );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com gradiente profissional */ }
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20" style={ {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        } }></div>
      </div>

      {/* Header com logo profissional */ }
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-xl px-6 py-3 border border-white/20">
              <img
                src={ nexusLogo }
                alt="TOIT Nexus"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-white font-bold text-xl">TOIT Nexus</h1>
                <p className="text-blue-200 text-sm">Portal do Cliente</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-blue-200 hover:text-white hover:bg-blue-800/50"
              onClick={ () => window.location.href = '/' }
            >
              ← Voltar para início
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 pt-24">
        <div className="w-full max-w-md">

          <Card className="bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardHeader className="space-y-4 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-blue-200">
              <div className="flex items-center justify-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Acesso Seguro
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium">
                    Entre com suas credenciais
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white/95">
              <form onSubmit={ handleSubmit } className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="cpf" className="text-lg font-semibold text-slate-700 flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>CPF *</span>
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={ cpf }
                    onChange={ handleCpfChange }
                    maxLength={ 14 }
                    className="text-xl h-14 border-4 border-black focus:border-blue-600 focus:ring-4 focus:ring-blue-200 text-black placeholder:text-gray-600 bg-gray-50 font-bold"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-lg font-semibold text-slate-700 flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    <span>Senha *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={ showPassword ? "text" : "password" }
                      placeholder="Digite sua senha"
                      value={ password }
                      onChange={ ( e ) => setPassword( e.target.value ) }
                      className="text-xl h-14 pr-16 border-4 border-black focus:border-blue-600 focus:ring-4 focus:ring-blue-200 text-black placeholder:text-gray-600 bg-gray-50 font-bold"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-gray-300 text-black hover:text-blue-600 border-l-4 border-black bg-gray-200"
                      onClick={ () => setShowPassword( !showPassword ) }
                    >
                      { showPassword ? (
                        <EyeOff className="h-6 w-6" />
                      ) : (
                        <Eye className="h-6 w-6" />
                      ) }
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={ isLoading }
                >
                  <div className="flex items-center justify-center space-x-2">
                    { isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Autenticando...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        <span>Acessar Portal</span>
                        <Sparkles className="h-5 w-5" />
                      </>
                    ) }
                  </div>
                </Button>

                <div className="text-center mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600">
                    Não tem uma conta?{ " " }
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-semibold underline-offset-4 hover:underline transition-colors duration-200"
                      onClick={ () => window.location.href = '/' }
                    >
                      Entre em contato
                    </button>
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-slate-500">
                    <Shield className="h-3 w-3" />
                    <span>Conexão segura e criptografada</span>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    Ao fazer login, você concorda com nossos{ " " }
                    <a href="#" className="text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline">
                      Termos de Uso
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Rodapé informativo */ }
          <div className="text-center mt-8 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
            <p className="text-sm text-blue-200">
              © 2025 TOIT Nexus. Todos os direitos reservados.
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Plataforma de gestão empresarial inteligente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}