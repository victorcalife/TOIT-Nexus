import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building, User, Mail, Lock, Phone } from "lucide-react";
import { UnifiedHeader } from "@/components/unified-header";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    companyName,
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trial = urlParams.get('trial') === 'true';
    const email = urlParams.get('email');
    
    setIsTrial(trial);
    if (email) {
      setFormData(prev => ({ ...prev, email) }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method,
        headers,
        },
        body,
          isTrial
        }),
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        // Redirect to onboarding or dashboard
        window.location.href = '/onboarding';
      } else {
        const errorData = await response.json();
        toast({
          title,
          description,
          variant,
        });
      }
    } catch (error) {
      console.error('Registration error, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UnifiedHeader />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            {isTrial && (
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                🎉 Teste Gratuito por 7 Dias
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {isTrial ? "Comece seu teste gratuito" : "Crie sua conta"}
            </h1>
            <p className="text-gray-600">
              Configure sua empresa e comece a automatizar em minutos
            </p>
          </div>

          <div className="grid lg) 99999-9999"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Segurança
                    </h3>
                    
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={handleInputChange}
                        minLength={8}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Digite a senha novamente"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        minLength={8}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover) => window.location.href = '/login'}
                    >
                      Fazer login
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">
                    {isTrial ? "Incluso no seu teste)}

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">🔒 Segurança Enterprise</h4>
                  <p className="text-sm text-gray-600">
                    Seus dados estão protegidos com criptografia de ponta, 
                    backups automáticos e conformidade com LGPD.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}