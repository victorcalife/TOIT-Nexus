import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Gift, Shield, Clock, CheckCircle } from "lucide-react";
import { StandardHeader } from "@/components/standard-header";
import { useToast } from "@/hooks/use-toast";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

export default function TrialSignup() {
  const [formData, setFormData] = useState({
    firstName,
    lastName,
    cpf,
    email,
    phone,
    password,
    confirmPassword);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cpf') {
      // Formatação CPF, '').slice(0, 11);
      formattedValue = formattedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (name === 'phone') {
      // Formatação telefone) 00000-0000
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
      if (formattedValue.length <= 10) {
        formattedValue = formattedValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        formattedValue = formattedValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    } else if (name === 'firstName' || name === 'lastName') {
      // Apenas letras e espaços
      formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 50);
    } else if (name === 'email') {
      // Email em minúsculas
      formattedValue = value.toLowerCase().slice(0, 100);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpar erros quando usuário digita
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors= [];
    
    if (!formData.firstName.trim()) {
      newErrors.push('Nome é obrigatório');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.push('Sobrenome é obrigatório');
    }
    
    if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.push('CPF deve ter 11 dígitos');
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.push('Email inválido');
    }
    
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.push('Telefone deve ter pelo menos 10 dígitos');
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Senhas não coincidem');
    }
    
    if (!acceptedTerms) {
      newErrors.push('Você deve aceitar os Termos de Uso');
    }
    
    if (!acceptedPrivacy) {
      newErrors.push('Você deve aceitar a Política de Privacidade');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // 1. Criar conta trial
      const signupResponse = await fetch('/api/trial/signup', {
        method,
        headers,
        },
        body,
          lastName,
          cpf, ''),
          email,
          phone, ''),
          password,
          acceptedTerms,
          acceptedPrivacy
        }),
      });

      const signupResult = await signupResponse.json();

      if (signupResponse.ok && signupResult.success) {
        toast({
          title,
          description,
        });

        // Redirecionar para verificação de cartão
        setTimeout(() => {
          window.location.href = `/verify-card?userId=${signupResult.userId}`;
        }, 2000);

      } else {
        setErrors([signupResult.message || 'Erro ao criar conta']);
      }

    } catch (error) {
      console.error('Erro no cadastro, error);
      setErrors(['Erro de conexão. Tente novamente.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StandardHeader showLoginButton={true} />
      
      <div className="flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-2xl">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={workflowLogo} 
                alt="TOIT Workflow" 
                className="h-20 w-auto opacity-90"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Comece seu trial gratuito
            </h1>
            <p className="text-gray-600">
              7 dias grátis • Sem compromisso • Cancele quando quiser
            </p>
          </div>

          {/* Benefícios do trial */}
          <div className="grid grid-cols-1 md) 00000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={15}
                    required
                  />
                </div>

                {/* Senha e Confirmação */}
                <div className="grid grid-cols-1 md) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      Aceito os <a href="/terms" className="text-blue-600 hover) => setAcceptedPrivacy(checked as boolean)}
                    />
                    <Label htmlFor="privacy" className="text-sm">
                      Aceito a <a href="/privacy" className="text-blue-600 hover, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Aviso sobre cartão */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <p className="text-blue-800 text-sm">
                      <strong>Próximo passo);
}
