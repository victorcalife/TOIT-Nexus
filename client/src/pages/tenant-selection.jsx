import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, Settings, Crown, Search } from "lucide-react";

export default function TenantSelection() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey,
    retry,
  });

  const selectTenantMutation = useMutation({
    mutationFn) => {
      await apiRequest('POST', '/api/auth/select-tenant', { tenantId });
    },
    onSuccess) => {
      window.location.href = '/';
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    },
  });

  const loginAsToitAdmin = () => {
    window.location.href = '/admin';
  };

  const filteredTenants = (tenants || []).filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'suspended':
        return 'Suspenso';
      default) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) {tenant.id} className="hover) {tenant.name}</CardTitle>
                          <p className="text-sm text-gray-500">@{tenant.slug}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(tenant.status)}>
                        {getStatusLabel(tenant.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Plano)}
                      
                      <div className="pt-3 border-t">
                        <Button 
                          className="w-full"
                          onClick={() => selectTenantMutation.mutate(tenant.id)}
                          disabled={selectTenantMutation.isPending || tenant.status !== 'active'}
                        >
                          {selectTenantMutation.isPending ? (
                            "Conectando..."
                          ) {tenant.name}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) {searchTerm ? 'Nenhuma empresa corresponde aos critérios de busca.' : 'Você não tem acesso a nenhuma empresa no momento.'}
              </p>
              <p className="text-sm text-gray-400">
                Entre em contato com a TOIT para solicitar acesso a uma empresa.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 TOIT - Tecnologia e Inovação. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}