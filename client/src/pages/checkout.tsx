import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StandardHeader } from "@/components/standard-header";
import { formatCpf, cleanCpf, validateCpf } from "@/lib/utils";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

// Stripe Elements
declare global {
  interface Window {
    Stripe: any;
  }
}

interface ProfileData {
  name: string;
  slug: string;
  monthly_price: number;
  yearly_price: number;
  description: string;
  features: string[];
}

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  
  // Customer data
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });

  const { toast } = useToast();

  // Get payment intent from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const intentId = urlParams.get('payment_intent');
    if (intentId) {
      setPaymentIntentId(intentId);
      loadPaymentIntentData(intentId);
    } else {
      // Redirect to landing if no payment intent
      window.location.href = '/';
    }
  }, []);

  // Initialize Stripe
  useEffect(() => {
    initializeStripe();
  }, []);

  const initializeStripe = async () => {
    try {
      const configResponse = await fetch('/api/stripe/config');
      const config = await configResponse.json();
      
      if (window.Stripe) {
        const stripeInstance = window.Stripe(config.publishable_key);
        setStripe(stripeInstance);
        
        const elementsInstance = stripeInstance.elements();
        setElements(elementsInstance);
        
        // Create card element
        const cardElementInstance = elementsInstance.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        });
        
        setCardElement(cardElementInstance);
        
        // Mount card element after a short delay to ensure DOM is ready
        setTimeout(() => {
          const cardContainer = document.getElementById('card-element');
          if (cardContainer && cardElementInstance) {
            cardElementInstance.mount('#card-element');
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar sistema de pagamento.",
        variant: "destructive",
      });
    }
  };

  const loadPaymentIntentData = async (intentId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stripe/payment-intent/${intentId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfileData(data.profile);
        setBillingCycle(data.billing_cycle);
        setCustomerData(data.customer_data || {});
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error loading payment intent:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do pagamento.",
        variant: "destructive",
      });
      // Redirect to landing on error
      setTimeout(() => window.location.href = '/', 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setCustomerData(prev => ({ ...prev, cpf: formatted }));
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return false;
    }

    if (!validateCpf(customerData.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!validateForm() || !stripe || !cardElement || !paymentIntentId) return;

    setIsProcessing(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentId, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Confirm payment on backend
      const confirmResponse = await fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
          customer_data: customerData
        })
      });

      const confirmData = await confirmResponse.json();

      if (confirmData.success) {
        toast({
          title: "Pagamento realizado!",
          description: "Sua conta foi criada com sucesso.",
        });
        
        // Redirect to success page or dashboard
        setTimeout(() => {
          window.location.href = `/verify-email?userId=${confirmData.user.id}`;
        }, 2000);
      } else {
        throw new Error(confirmData.message);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Erro ao processar pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPrice = () => {
    if (!profileData) return 0;
    return billingCycle === 'monthly' ? profileData.monthly_price : profileData.yearly_price;
  };

  const getSavings = () => {
    if (!profileData || billingCycle === 'monthly') return 0;
    const monthlyTotal = profileData.monthly_price * 12;
    return monthlyTotal - profileData.yearly_price;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StandardHeader showLoginButton={false} />
      
      <div className="flex items-center justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={workflowLogo} 
                alt="TOIT Workflow" 
                className="h-16 w-auto opacity-90"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finalizar Assinatura
            </h1>
            <p className="text-gray-600">
              Complete seu pagamento para ativar sua conta TOIT Nexus
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Dados de Pagamento
                </CardTitle>
                <CardDescription>
                  Preencha seus dados para finalizar a assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Informações Pessoais</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={customerData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={customerData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={customerData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                          id="cpf"
                          type="text"
                          placeholder="000.000.000-00"
                          value={customerData.cpf}
                          onChange={handleCpfChange}
                          maxLength={14}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Card Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Dados do Cartão</h3>
                  
                  <div>
                    <Label htmlFor="card-element">Cartão de Crédito *</Label>
                    <div 
                      id="card-element" 
                      className="mt-2 p-3 border border-gray-300 rounded-md bg-white"
                    >
                      {/* Stripe Elements will mount here */}
                    </div>
                    <div id="card-errors" className="text-red-500 text-sm mt-1"></div>
                  </div>
                </div>

                <Separator />

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Pagamento Seguro</p>
                    <p className="text-green-700">
                      Seus dados são protegidos com criptografia SSL e processados pelo Stripe.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={processPayment}
                    disabled={isProcessing || !stripe}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-lg py-6"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Finalizar Pagamento
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-0 shadow-xl h-fit">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData && (
                  <>
                    {/* Plan Details */}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {profileData.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {profileData.description}
                      </p>
                      
                      {/* Billing Cycle Toggle */}
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setBillingCycle('monthly')}
                          className="flex-1"
                        >
                          Mensal
                        </Button>
                        <Button
                          variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setBillingCycle('yearly')}
                          className="flex-1"
                        >
                          Anual
                          {getSavings() > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              Economize {formatCurrency(getSavings())}
                            </Badge>
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Features */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Incluído no plano:</h4>
                      <ul className="space-y-2">
                        {profileData.features?.slice(0, 5).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                        {profileData.features?.length > 5 && (
                          <li className="text-sm text-gray-500">
                            +{profileData.features.length - 5} recursos adicionais
                          </li>
                        )}
                      </ul>
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Plano {billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(getPrice())}
                        </span>
                      </div>
                      
                      {billingCycle === 'yearly' && getSavings() > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>Economia anual</span>
                          <span className="font-medium">
                            -{formatCurrency(getSavings())}
                          </span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(getPrice())}</span>
                      </div>
                    </div>

                    {/* Trial Notice */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>7 dias grátis!</strong> Você só será cobrado após o período de teste.
                        Cancele quando quiser.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Stripe.js Script */}
      <script src="https://js.stripe.com/v3/"></script>
    </div>
  );
}
