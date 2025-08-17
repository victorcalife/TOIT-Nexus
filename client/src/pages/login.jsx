import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { Eye, EyeOff, Loader2, Shield, Zap } from 'lucide-react';

export default function Login()
{
  const [ formData, setFormData ] = useState( {
    identifier: '',
    password: '',
    rememberMe: false
  } );
  const [ showPassword, setShowPassword ] = useState( false );
  const [ isSubmitting, setIsSubmitting ] = useState( false );
  const [ error, setError ] = useState( '' );

  const { login, isAuthenticated, loginError } = useAuth();
  const navigate = useNavigate();
  const [ searchParams ] = useSearchParams();

  // Redirecionar se já autenticado
  useEffect( () =>
  {
    if ( isAuthenticated )
    {
      const redirect = searchParams.get( 'redirect' ) || '/dashboard';
      navigate( redirect, { replace: true } );
    }
  }, [ isAuthenticated, navigate, searchParams ] );

  // Atualizar erro quando loginError mudar
  useEffect( () =>
  {
    if ( loginError )
    {
      setError( loginError.message || 'Erro no login' );
      setIsSubmitting( false );
    }
  }, [ loginError ] );

  const handleInputChange = ( e ) =>
  {
    const { name, value, type, checked } = e.target;
    setFormData( prev => ( {
      ...prev,
      [ name ]: type === 'checkbox' ? checked : value
    } ) );

    // Limpar erro quando usuário começar a digitar
    if ( error ) setError( '' );
  };

  const handleSubmit = async ( e ) =>
  {
    e.preventDefault();

    if ( !formData.identifier || !formData.password )
    {
      setError( 'Por favor, preencha todos os campos' );
      return;
    }

    setIsSubmitting( true );
    setError( '' );

    try
    {
      await login( formData );

      // Sucesso - redirecionamento será feito pelo useEffect
      const redirect = searchParams.get( 'redirect' ) || '/dashboard';
      navigate( redirect, { replace: true } );

    } catch ( err )
    {
      setError( err.message || 'Erro no login' );
      setIsSubmitting( false );
    }
  };

  const togglePasswordVisibility = () =>
  {
    setShowPassword( !showPassword );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo e Header */ }
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TOIT Nexus
          </h1>
          <p className="text-gray-600">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Card de Login */ }
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Entrar
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Digite seu email ou CPF e senha para acessar
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={ handleSubmit } className="space-y-6">
              {/* Campo Email/CPF */ }
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                  Email ou CPF
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="seu@email.com ou 000.000.000-00"
                  value={ formData.identifier }
                  onChange={ handleInputChange }
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={ isSubmitting }
                  autoComplete="username"
                  autoFocus
                />
              </div>

              {/* Campo Senha */ }
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={ showPassword ? 'text' : 'password' }
                    placeholder="Digite sua senha"
                    value={ formData.password }
                    onChange={ handleInputChange }
                    className="h-11 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={ isSubmitting }
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={ togglePasswordVisibility }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={ isSubmitting }
                  >
                    { showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    ) }
                  </button>
                </div>
              </div>

              {/* Lembrar de mim */ }
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={ formData.rememberMe }
                  onCheckedChange={ ( checked ) =>
                    setFormData( prev => ( { ...prev, rememberMe: checked } ) )
                  }
                  disabled={ isSubmitting }
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Lembrar de mim
                </Label>
              </div>

              {/* Erro */ }
              { error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    { error }
                  </AlertDescription>
                </Alert>
              ) }

              {/* Botão de Login */ }
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={ isSubmitting }
              >
                { isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                ) }
              </Button>
            </form>

            {/* Links adicionais */ }
            <div className="mt-6 text-center space-y-2">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={ () =>
                {
                  // TODO: Implementar recuperação de senha
                  alert( 'Funcionalidade em desenvolvimento' );
                } }
              >
                Esqueceu sua senha?
              </button>

              <div className="text-sm text-gray-500">
                Não tem uma conta?{ ' ' }
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  onClick={ () =>
                  {
                    // TODO: Implementar registro
                    alert( 'Entre em contato conosco para criar uma conta' );
                  } }
                >
                  Entre em contato
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */ }
        <div className="text-center text-sm text-gray-500">
          <p>
            © 2024 TOIT - Tecnologia e Inovação. Todos os direitos reservados.
          </p>
          <div className="mt-2 space-x-4">
            <button className="hover:text-gray-700 transition-colors">
              Termos de Uso
            </button>
            <button className="hover:text-gray-700 transition-colors">
              Política de Privacidade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}