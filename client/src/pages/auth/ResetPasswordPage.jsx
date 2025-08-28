import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {  
  Lock, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setError('Token de redefinição não encontrado');
      setIsValidToken(false);
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate) => {
    try {
      // Simular validação do token
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular token válido (em produção, fazer chamada para API)
      if (tokenToValidate && tokenToValidate.length > 10) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        setError('Token inválido ou expirado');
      }
    } catch (err) {
      setIsValidToken(false);
      setError('Erro ao validar token');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    const passwordStrength = getPasswordStrength(formData.password);
    if (passwordStrength < 3) {
      setError('A senha deve ser mais forte. Use letras maiúsculas, minúsculas, números e símbolos.');
      return;
    }

    setIsLoading(true);

    try { // Simular redefinição de senha
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess('Senha redefinida com sucesso!');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' 
          }
        });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Forte'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  // Loading state while validating token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600">Validando token de redefinição...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-600">Token Inválido</CardTitle>
              <CardDescription>
                O link de redefinição de senha é inválido ou expirou
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Links de redefinição de senha expiram em 24 horas por segurança.
                </p>
                
                <Button asChild className="w-full">
                  <Link to="/forgot-password">
                    Solicitar Novo Link
                  </Link>
                </Button>
                
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar ao login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nova Senha</h1>
          <p className="text-gray-600 mt-2">
            Crie uma senha forte para proteger sua conta
          </p>
        </div>

        {/* Reset Password Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <Shield className="h-6 w-6 mr-2 text-green-600" />
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-center">
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success} Redirecionando para o login...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button> 
                </div>
               </div> 
                { formData.password && (  
                  <><div className="space-y-1">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200' }`}   
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Força da senha: {strengthLabels[passwordStrength - 1] || 'Muito fraca'}
                    </p>
                  </div>
                  </>
               
                    )}
              
           

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-600">As senhas não coincidem</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                  <p className="text-xs text-green-600">✓ Senhas coincidem</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Requisitos da senha:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{formData.password.length >= 8 ? '✓' : '○'}</span>
                    Pelo menos 8 caracteres
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                    Uma letra maiúscula
                  </li>
                  <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                    Uma letra minúscula
                  </li>
                  <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{/[0-9]/.test(formData.password) ? '✓' : '○'}</span>
                    Um número
                  </li>
                  <li className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '○'}</span>
                    Um caractere especial
                  </li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Redefinindo...
                  </>
                ) : success ? (
                  'Senha Redefinida!'
                ) : (
                  'Redefinir Senha'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm">Dica de Segurança</h3>
                  <p className="text-xs text-blue-800 mt-1">
                    Use uma senha única que você não usa em outros sites. 
                    Considere usar um gerenciador de senhas para maior segurança.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 TOIT Nexus. Todos os direitos reservados.</p>
        </div>
      </div>
    )


};

export default ResetPasswordPage;
