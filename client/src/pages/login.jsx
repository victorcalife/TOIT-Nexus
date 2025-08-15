import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCpf, cleanCpf, validateCpf } from "@/lib/utils";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

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
    <div className="min-h-screen bg-gray-100">
      {/* Header simples */ }
      <div className="absolute top-4 left-4">
        <button
          onClick={ () => window.location.href = '/' }
          className="text-gray-800 hover:text-black text-sm font-bold bg-white px-3 py-1 rounded shadow"
        >
          ← Voltar para início
        </button>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo no container de login */ }
          <div className="text-center mb-8 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-center mb-4">
              <img
                src={ workflowLogo }
                alt="TOIT Workflow"
                className="h-20 w-auto opacity-90"
              />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">
              TOIT Nexus
            </h1>
            <p className="text-gray-800 mt-2 font-medium">
              Faça login em sua conta
            </p>
          </div>

          <Card className="border-2 border-black shadow-2xl bg-white">
            <CardHeader className="space-y-1 pb-6 bg-blue-50 rounded-t-lg border-b-2 border-gray-300">
              <CardTitle className="text-2xl font-bold text-center text-black">
                Entrar na Plataforma
              </CardTitle>
              <CardDescription className="text-center text-black font-bold">
                Digite seu CPF e senha para acessar a plataforma TOIT Nexus
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <form onSubmit={ handleSubmit } className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="cpf" className="text-lg font-bold text-black block">
                    CPF *
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
                  <Label htmlFor="password" className="text-lg font-bold text-black block">
                    Senha *
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
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={ isLoading }
                >
                  { isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    "Entrar"
                  ) }
                </Button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{ " " }
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-medium underline-offset-4 hover:underline transition-colors"
                      onClick={ () => window.location.href = '/' }
                    >
                      Entre em contato
                    </button>
                  </p>
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
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2025 TOIT Nexus. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}