# 📚 TQL - MANUAL COMPLETO DO USUÁRIO
**TOIT Query Language - Linguagem de Consulta em Português**

---

## 📋 ÍNDICE

1. [Introdução](#introdução)
2. [Conceitos Básicos](#conceitos-básicos)
3. [Sintaxe Fundamental](#sintaxe-fundamental)
4. [Funções Temporais](#funções-temporais)
5. [Operadores e Filtros](#operadores-e-filtros)
6. [Variáveis Calculadas](#variáveis-calculadas)
7. [Dashboards](#dashboards)
8. [Tipos de Gráficos](#tipos-de-gráficos)
9. [Personalização Visual](#personalização-visual)
10. [Exemplos Práticos](#exemplos-práticos)
11. [Referência Rápida](#referência-rápida)

---

# 🎯 INTRODUÇÃO

## O que é TQL?

TQL (TOIT Query Language) é uma linguagem de consulta **100% em português brasileiro** que permite criar relatórios, dashboards e análises de dados de forma simples e intuitiva, sem precisar conhecer SQL ou programação.

## Para que serve?

- ✅ **Consultar dados** de qualquer tabela (Excel, banco de dados, APIs)
- ✅ **Criar relatórios** executivos e operacionais
- ✅ **Construir dashboards** interativos com gráficos
- ✅ **Calcular métricas** complexas com variáveis
- ✅ **Filtrar informações** por período, cliente, departamento, etc.

---

# 🧠 CONCEITOS BÁSICOS

## Estrutura Fundamental

Toda consulta TQL segue esta estrutura:

```
[AÇÃO] [CAMPO] DE [TABELA] [FILTROS] [FORMATO]
```

### Exemplos Simples:
```tql
MOSTRAR funcionarios;                    # Lista todos os funcionários
SOMAR salario DE funcionarios;           # Soma todos os salários
CONTAR tickets DE suporte;               # Conta quantos tickets existem
MEDIA idade DE clientes;                 # Calcula idade média dos clientes
```

---

# 📝 SINTAXE FUNDAMENTAL

## 1. AÇÕES BÁSICAS

### MOSTRAR - Exibir dados
```tql
MOSTRAR produtos;                        # Lista todos os produtos
MOSTRAR nome DE funcionarios;            # Mostra apenas os nomes
MOSTRAR nome, salario DE funcionarios;   # Múltiplos campos
```

### SOMAR - Totalizar valores
```tql
SOMAR faturamento DE vendas;             # Soma total de vendas
SOMAR horas DE projetos;                 # Total de horas trabalhadas
SOMAR preco DE produtos;                 # Soma preços de produtos
```

### CONTAR - Quantidade de registros
```tql
CONTAR funcionarios;                     # Quantos funcionários existem
CONTAR vendas;                           # Quantas vendas foram feitas
CONTAR tickets DE suporte;               # Quantos tickets de suporte
```

### MEDIA - Calcular média
```tql
MEDIA salario DE funcionarios;           # Salário médio
MEDIA idade DE clientes;                 # Idade média dos clientes
MEDIA valor DE vendas;                   # Ticket médio de vendas
```

### MAX - Valores máximos (TQL 3.0 PLUS)
```tql
# VALORES ÚNICOS
MAX salario DE funcionarios;             # Maior salário (retorna: 15000)
MAX idade DE clientes;                   # Cliente mais velho (retorna: 65)

# REGISTROS ÚNICOS
MAX funcionarios POR salario;            # Funcionário com maior salário (retorna: {nome: "João"...})
MAX clientes POR idade;                  # Cliente mais velho (retorna: {nome: "Pedro"...})

# MÚLTIPLOS REGISTROS - DUAS SINTAXES:
MAX(5) funcionarios POR salario;         # 🔥 NOVO: Com parênteses
MAX 5 funcionarios POR salario;          # ✅ MANTÉM: Sem parênteses

MAX(10) vendedores POR comissao;         # Top 10 vendedores
```

### MIN - Valores mínimos (TQL 3.0 PLUS)
```tql
# VALORES ÚNICOS
MIN salario DE funcionarios;             # Menor salário (retorna: 2000)
MIN idade DE clientes;                   # Cliente mais novo (retorna: 18)

# REGISTROS ÚNICOS
MIN funcionarios POR salario;            # Funcionário com menor salário
MIN clientes POR idade;                  # Cliente mais novo

# MÚLTIPLOS REGISTROS - DUAS SINTAXES:
MIN(3) produtos POR vendas;              # 🔥 NOVO: Com parênteses
MIN 3 produtos POR vendas;               # ✅ MANTÉM: Sem parênteses
```

### Exemplos Combinados
```tql
# Estatísticas completas de salários
min_salario = MIN salario DE funcionarios;      # Menor salário
max_salario = MAX salario DE funcionarios;      # Maior salário
media_salario = MEDIA salario DE funcionarios;  # Salário médio
total_funcionarios = CONTAR funcionarios;       # Total de funcionários
```

## 2. RANKINGS E CLASSIFICAÇÕES (TQL 3.0)

### RANKING - Classificação completa
```tql
RANKING funcionarios POR salario DESC;        # Do maior para menor salário
RANKING clientes POR faturamento ASC;         # Do menor para maior faturamento
RANKING vendedores POR comissao DESC;         # Maiores comissões primeiro
```

### MAX/MIN - Melhores e piores (substitui TOP/PIOR)
```tql
# 🔥 TQL 3.0 PLUS - SINTAXE UNIFICADA:
MAX(10) funcionarios POR performance;         # 10 melhores funcionários
MAX(5) produtos POR vendas;                   # 5 produtos mais vendidos
MIN(3) clientes POR pagamento;                # 3 piores pagadores

# Também funciona sem parênteses:
MAX 10 funcionarios POR performance;          # 10 melhores funcionários
MIN 3 clientes POR pagamento;                 # 3 piores pagadores
```

---

# ⏰ FUNÇÕES TEMPORAIS

## Conceito de Tempo Relativo

TQL usa funções temporais simples baseadas no **hoje**:

### DIA(±n) - Dias relativos
```tql
DIA(0)      # Hoje
DIA(+1)     # Amanhã  
DIA(-1)     # Ontem
DIA(+7)     # Daqui a 7 dias
DIA(-30)    # 30 dias atrás
```

### MES(±n) - Meses relativos
```tql
MES(0)      # Este mês
MES(+1)     # Próximo mês
MES(-1)     # Mês passado
MES(-3)     # 3 meses atrás
```

### ANO(±n) - Anos relativos
```tql
ANO(0)      # Este ano
ANO(+1)     # Próximo ano
ANO(-1)     # Ano passado
ANO(-2)     # 2 anos atrás
```

## Exemplos Práticos Temporais

### Vendas por Período:
```tql
# ✅ SINTAXE TQL 2.0 - Mais intuitiva!

# Vendas de hoje (valor específico)
SOMAR valor DE vendas ONDE data = DIA(0);

# Vendas do mês passado (valor específico)
SOMAR valor DE vendas ONDE data = MES(-1);

# Vendas de múltiplos meses (lista automática)
SOMAR valor DE vendas ONDE data = (MES(-3), MES(-2), MES(-1));

# Vendas dos últimos 30 dias (range)
SOMAR valor DE vendas ONDE data ENTRE DIA(-30) E DIA(0);
```

### Funcionários por Admissão:
```tql
# Funcionários admitidos este ano (valor específico)
CONTAR funcionarios ONDE admissao = ANO(0);

# Funcionários de múltiplos departamentos (lista automática)
CONTAR funcionarios ONDE departamento = (TI, RH, Vendas, Marketing);

# Funcionários com mais de 5 anos na empresa (comparação)
CONTAR funcionarios ONDE admissao < ANO(-5);
```

---

# 🔍 OPERADORES E FILTROS

## ONDE - Filtros Condicionais

### Regras dos Operadores:

**🔥 REGRA REVOLUCIONÁRIA TQL 2.0:**
- **`=`** → Operador universal! Detecta automaticamente valor único vs lista
- **`ENTRE...E`** → Para ranges (intervalos)
- **`> < >= <=`** → Para comparações numéricas

**🎯 DETECÇÃO AUTOMÁTICA:**
- `campo = valor` → SQL: `campo = 'valor'`
- `campo = (val1, val2, val3)` → SQL: `campo IN ('val1', 'val2', 'val3')`

**🚀 VANTAGENS DA REVOLUÇÃO TQL 2.0:**
- ✅ **Um só operador** para memorizar (`=`)
- ✅ **Parser inteligente** detecta automaticamente
- ✅ **Sintaxe natural** como conversa humana
- ✅ **Compatível com SQL** padrão (= e IN)
- ✅ **Menos confusão** para usuários iniciantes
- ✅ **Mais produtivo** para usuários avançados

### Operadores Unificados TQL 2.0:
```tql
# ✅ VALOR ÚNICO - sintaxe simples
MOSTRAR funcionarios ONDE departamento = TI;
MOSTRAR vendas ONDE data = DIA(0);           # Hoje
MOSTRAR vendas ONDE mes = MES(-1);           # Mês passado
MOSTRAR produtos ONDE status = ativo;

# ✅ LISTA DE VALORES - parênteses = detecção automática IN
MOSTRAR funcionarios ONDE departamento = (TI, Vendas, Marketing);
MOSTRAR produtos ONDE categoria = (eletrônicos, roupas, livros);
MOSTRAR tickets ONDE prioridade = (alta, crítica);
MOSTRAR vendas ONDE região = (SP, RJ, MG, RS);

# ✅ RANGES - mantém ENTRE...E
MOSTRAR vendas ONDE data ENTRE DIA(-30) E DIA(0);    # Últimos 30 dias
MOSTRAR vendas ONDE data ENTRE MES(-3) E MES(0);     # Últimos 3 meses
MOSTRAR funcionarios ONDE salario ENTRE 3000 E 8000;

# ✅ COMPARAÇÕES NUMÉRICAS - mantém operadores clássicos
MOSTRAR funcionarios ONDE salario > 5000;
MOSTRAR funcionarios ONDE idade < 30;
MOSTRAR produtos ONDE categoria != descontinuado;
MOSTRAR vendas ONDE valor >= 1000;

# Menor ou igual
MOSTRAR funcionarios ONDE salario <= 3000;
```

### Operadores Lógicos:
```tql
# E (AND)
MOSTRAR funcionarios ONDE departamento = "TI" E salario > 5000;

# OU (OR)  
MOSTRAR funcionarios ONDE departamento = "TI" OU departamento = "RH";

# Múltiplas condições
MOSTRAR vendas ONDE valor > 1000 E data EM MES(0) E cliente = "Empresa ABC";
```

### Operadores de Texto:
```tql
# Contém
MOSTRAR clientes ONDE nome TEM "Silva";

# Não contém
MOSTRAR produtos ONDE nome NTEM "Descontinuado";

# Lista de valores
MOSTRAR funcionarios ONDE departamento EM ("TI", "RH", "Financeiro");
```

---

# 🧮 VARIÁVEIS CALCULADAS

## Criando Variáveis

Você pode criar variáveis para cálculos complexos:

### Exemplo Básico:
```tql
# Definir variáveis
receita_mes = SOMAR faturamento DE vendas ONDE data EM MES(0);
custo_mes = SOMAR despesas DE gastos ONDE data EM MES(0);

# Usar variáveis em cálculos
lucro_mes = receita_mes - custo_mes;
margem = lucro_mes / receita_mes * 100;
```

### Exemplo Avançado - ROI de Projeto:
```tql
# Receitas do projeto
receita_projeto = SOMAR valor DE vendas ONDE projeto = "Portal TOIT";

# Custos de desenvolvimento
custo_dev = SOMAR horas * valor_hora DE trabalho ONDE projeto = "Portal TOIT";

# Custos de infraestrutura
custo_infra = SOMAR valor DE gastos ONDE categoria = "servidor" E projeto = "Portal TOIT";

# Cálculo final do ROI
investimento_total = custo_dev + custo_infra;
retorno_liquido = receita_projeto - investimento_total;
roi_percentual = retorno_liquido / investimento_total * 100;
```

## Operações Matemáticas

### Operadores Básicos:
```tql
# Adição
total = vendas_q1 + vendas_q2;

# Subtração  
diferenca = vendas_atual - vendas_anterior;

# Multiplicação
comissao_total = vendas * 0.05;

# Divisão
ticket_medio = faturamento_total / numero_vendas;

# Percentual
crescimento = (vendas_atual - vendas_anterior) / vendas_anterior * 100;
```

---

# 📊 DASHBOARDS

## Criando Dashboards

Dashboards agrupam múltiplos widgets (gráficos, KPIs, tabelas):

### Sintaxe Básica:
```tql
DASHBOARD "Nome do Dashboard":
    KPI variavel TITULO "Nome", CONFIGURAÇÕES;
    GRAFICO tipo DE dados TITULO "Nome", CONFIGURAÇÕES;
    TABELA dados CONFIGURAÇÕES;
```

### Exemplo Completo - Dashboard Vendas:
```tql
# Definir variáveis primeiro
vendas_mes = SOMAR valor DE vendas ONDE data EM MES(0);
vendas_mes_anterior = SOMAR valor DE vendas ONDE data EM MES(-1);
crescimento = (vendas_mes - vendas_mes_anterior) / vendas_mes_anterior * 100;
meta_mes = 100000;

# Criar dashboard
DASHBOARD "Vendas Mensal":
    KPI vendas_mes TITULO "Vendas do Mês", MOEDA R$, COR azul;
    KPI crescimento TITULO "Crescimento vs Mês Anterior", FORMATO %, 
        COR verde SE >0, COR vermelho SE <0;
    KPI meta_mes TITULO "Meta do Mês", MOEDA R$, COR cinza;
    GRAFICO barras DE vendas_mes, vendas_mes_anterior TITULO "Comparativo Mensal";
    TABELA TOP 10 vendedores POR comissao DE vendas;
```

### Exemplo - Dashboard Executivo:
```tql
# KPIs principais
faturamento_anual = SOMAR receita DE vendas ONDE data = ANO(0);
funcionarios_ativos = CONTAR funcionarios ONDE status = "ativo";
projetos_andamento = CONTAR projetos ONDE status = "em andamento";
satisfacao_cliente = MEDIA nota DE pesquisas ONDE data ULTIMOS MES(3);

DASHBOARD "Executivo":
    KPI faturamento_anual TITULO "Faturamento Anual", MOEDA R$;
    KPI funcionarios_ativos TITULO "Funcionários Ativos";
    KPI projetos_andamento TITULO "Projetos em Andamento";
    KPI satisfacao_cliente TITULO "Satisfação Cliente", FORMATO decimal;
    GRAFICO linha DE faturamento_anual PERIODO ULTIMOS MES(12);
```

---

# 📈 TIPOS DE GRÁFICOS

## Gráficos Disponíveis

### 1. BARRAS - Gráfico de barras verticais
```tql
GRAFICO barras DE vendas_q1, vendas_q2, vendas_q3, vendas_q4;
GRAFICO barras DE funcionarios AGRUPADO POR departamento;
```

### 2. BARRAS_H - Gráfico de barras horizontais
```tql
GRAFICO barras_h DE TOP 10 produtos POR vendas;
```

### 3. LINHA - Gráfico de linha (temporal)
```tql
GRAFICO linha DE vendas PERIODO ULTIMOS MES(12);
GRAFICO linha DE funcionarios PERIODO ULTIMOS ANO(3);
```

### 4. PIZZA - Gráfico pizza/torta
```tql
GRAFICO pizza DE vendas AGRUPADO POR regiao;
GRAFICO pizza DE funcionarios AGRUPADO POR departamento;
```

### 5. ROSQUINHA - Gráfico donut
```tql
GRAFICO rosquinha DE despesas AGRUPADO POR categoria;
```

### 6. AREA - Gráfico de área
```tql
GRAFICO area DE lucro PERIODO ULTIMOS MES(6);
```

### 7. GAUGE - Velocímetro/medidor
```tql
GRAFICO gauge DE sla_compliance MIN 0, MAX 100, META 95;
```

### 8. SCATTER - Dispersão/pontos
```tql
GRAFICO scatter DE salario, performance DE funcionarios;
```

### 9. HEATMAP - Mapa de calor
```tql
GRAFICO heatmap DE vendas AGRUPADO POR mes, regiao;
```

---

# 🎨 PERSONALIZAÇÃO VISUAL

## Configurações de KPI

### Formatação:
```tql
KPI valor TITULO "Nome do KPI",
    MOEDA R$,                    # Formato monetário brasileiro
    FORMATO %,                   # Formato percentual
    FORMATO decimal,             # Número decimal
    FORMATO inteiro;             # Número inteiro
```

### Valores Condicionais:
```tql
KPI sla_compliance TITULO "SLA",
    FORMATO %,                  # Formato percentual
    LIMITE_BOM 90,              # Verde automático se >90%
    LIMITE_ATENCAO 80;          # Amarelo automático se 80-90%, vermelho se <80%
```

**🎨 CORES AUTOMÁTICAS POR VALOR:**
- Sistema aplica cores baseadas nos limites definidos
- Verde: valor bom, Amarelo: atenção, Vermelho: crítico

## Configurações de Gráficos

### Títulos e Dimensões:
```tql
GRAFICO barras DE vendas TITULO "Vendas por Trimestre";
GRAFICO barras DE vendas ALTURA 400px, LARGURA 600px;
```

**🎨 CORES AUTOMÁTICAS:**
- Sistema gera cores sobrias automaticamente
- Personalização visual feita diretamente no gráfico renderizado
- Quantidade ilimitada de dados suportada

## Escalas e Unidades

### Eixos Personalizados:
```tql
GRAFICO linha DE vendas
    EIXO_Y_MIN 0,
    EIXO_Y_MAX 1000000,
    EIXO_Y_TITULO "Valor em R$",
    EIXO_X_TITULO "Período";
```

---

# 💼 EXEMPLOS PRÁTICOS

## 1. Análise de RH

### Dashboard Recursos Humanos:
```tql
# Variáveis de RH
total_funcionarios = CONTAR funcionarios ONDE status = "ativo";
salario_medio = MEDIA salario DE funcionarios ONDE status = "ativo";
admissoes_mes = CONTAR funcionarios ONDE admissao EM MES(0);
demissoes_mes = CONTAR funcionarios ONDE demissao EM MES(0);
turnover = demissoes_mes / total_funcionarios * 100;

DASHBOARD "Recursos Humanos":
    KPI total_funcionarios TITULO "Funcionários Ativos";
    KPI salario_medio TITULO "Salário Médio", MOEDA R$;
    KPI admissoes_mes TITULO "Admissões este Mês", COR verde;
    KPI demissoes_mes TITULO "Demissões este Mês", COR vermelho;
    KPI turnover TITULO "Turnover Mensal", FORMATO %, 
        COR verde SE <5, COR amarelo SE <10, COR vermelho SE >=10;
    GRAFICO pizza DE funcionarios AGRUPADO POR departamento;
    GRAFICO barras DE salario_medio AGRUPADO POR departamento;
```

## 2. Análise Financeira

### Dashboard Financeiro:
```tql
# Receitas e custos
receita_trimestre = SOMAR receita DE financeiro ONDE data ULTIMOS MES(3);
despesas_trimestre = SOMAR despesas DE gastos ONDE data ULTIMOS MES(3);
lucro_bruto = receita_trimestre - despesas_trimestre;
margem_lucro = lucro_bruto / receita_trimestre * 100;

# Comparativo com trimestre anterior
receita_trimestre_anterior = SOMAR receita DE financeiro 
    ONDE data ENTRE MES(-6) E MES(-3);
crescimento_receita = (receita_trimestre - receita_trimestre_anterior) / 
    receita_trimestre_anterior * 100;

DASHBOARD "Financeiro - Trimestral":
    KPI receita_trimestre TITULO "Receita Trimestre", MOEDA R$;
    KPI despesas_trimestre TITULO "Despesas Trimestre", MOEDA R$;
    KPI lucro_bruto TITULO "Lucro Bruto", MOEDA R$;
    KPI margem_lucro TITULO "Margem de Lucro", FORMATO %, 
        COR verde SE >20, COR amarelo SE >10, COR vermelho SE <=10;
    KPI crescimento_receita TITULO "Crescimento vs Trimestre Anterior", FORMATO %;
    GRAFICO linha DE receita_trimestre PERIODO ULTIMOS ANO(2);
    GRAFICO pizza DE despesas_trimestre AGRUPADO POR categoria;
```

## 3. Análise de Vendas

### Dashboard Comercial:
```tql
# Métricas de vendas
vendas_ano = SOMAR valor DE vendas ONDE data EM ANO(0);
meta_ano = 1200000;
percentual_meta = vendas_ano / meta_ano * 100;
ticket_medio = MEDIA valor DE vendas ONDE data EM ANO(0);
numero_vendas = CONTAR vendas ONDE data EM ANO(0);

# Performance de vendedores
melhor_vendedor = TOP 1 vendedores POR comissao DE vendas ONDE data EM MES(0);

DASHBOARD "Comercial - Anual":
    KPI vendas_ano TITULO "Vendas do Ano", MOEDA R$;
    KPI meta_ano TITULO "Meta Anual", MOEDA R$;
    KPI percentual_meta TITULO "% da Meta Atingida", FORMATO %, 
        COR verde SE >100, COR amarelo SE >80, COR vermelho SE <=80;
    KPI ticket_medio TITULO "Ticket Médio", MOEDA R$;
    KPI numero_vendas TITULO "Número de Vendas";
    GRAFICO barras DE vendas_ano AGRUPADO POR mes;
    GRAFICO pizza DE vendas_ano AGRUPADO POR vendedor;
    TABELA TOP 10 vendedores POR comissao DE vendas;
```

## 4. Análise Operacional - ITSM

### Dashboard Suporte Técnico:
```tql
# Tickets por status
tickets_abertos = CONTAR tickets DE suporte ONDE status = "aberto";
tickets_andamento = CONTAR tickets DE suporte ONDE status = "em andamento";
tickets_resolvidos_mes = CONTAR tickets DE suporte 
    ONDE status = "resolvido" E resolucao EM MES(0);

# SLA e performance
sla_compliance = MEDIA sla_ok DE tickets ONDE resolucao EM MES(0) * 100;
tempo_medio_resolucao = MEDIA tempo_resolucao DE tickets 
    ONDE resolucao EM MES(0);

# Satisfação
satisfacao_media = MEDIA nota_satisfacao DE pesquisas ONDE data EM MES(0);

DASHBOARD "Suporte Técnico":
    KPI tickets_abertos TITULO "Tickets Abertos", 
        COR verde SE <20, COR amarelo SE <50, COR vermelho SE >=50;
    KPI tickets_andamento TITULO "Em Andamento";
    KPI tickets_resolvidos_mes TITULO "Resolvidos este Mês", COR verde;
    KPI sla_compliance TITULO "SLA Compliance", FORMATO %, 
        COR verde SE >95, COR amarelo SE >85, COR vermelho SE <=85;
    KPI tempo_medio_resolucao TITULO "Tempo Médio Resolução", UNIDADE horas;
    KPI satisfacao_media TITULO "Satisfação Cliente", FORMATO decimal;
    GRAFICO linha DE tickets_resolvidos_mes PERIODO ULTIMOS MES(6);
    GRAFICO pizza DE tickets AGRUPADO POR categoria;
    TABELA RANKING tecnicos POR tickets_resolvidos DESC;
```

---

# 📖 REFERÊNCIA RÁPIDA

## Ações Principais
| Comando | Função | Exemplo |
|---------|--------|---------|
| `MOSTRAR` | Exibir dados | `MOSTRAR funcionarios` |
| `SOMAR` | Totalizar | `SOMAR salario DE funcionarios` |
| `CONTAR` | Quantidade | `CONTAR tickets DE suporte` |
| `MEDIA` | Média | `MEDIA idade DE clientes` |
| `MAX` | Maior valor | `MAX salario DE funcionarios` |
| `MIN` | Menor valor | `MIN preco DE produtos` |
| `RANKING` | Classificação | `RANKING vendedores POR vendas DESC` |
| `TOP` | Melhores N | `TOP 10 clientes POR faturamento` |
| `PIOR` | Piores N | `PIOR 5 produtos POR vendas` |

## Operadores
| Operador | Significado | Exemplo |
|----------|-------------|---------|
| `=` | Igual | `status = "ativo"` |
| `!=` | Diferente | `categoria != "descontinuado"` |
| `>` | Maior | `salario > 5000` |
| `<` | Menor | `idade < 30` |
| `>=` | Maior igual | `vendas >= 1000` |
| `<=` | Menor igual | `preco <= 100` |
| `TEM` | Contém | `nome TEM "Silva"` |
| `NTEM` | Não contém | `titulo NTEM "Urgente"` |
| `E` | AND lógico | `depto = "TI" E salario > 5000` |
| `OU` | OR lógico | `status = "ativo" OU status = "pendente"` |

## Funções Temporais
| Função | Significado | Exemplo |
|--------|-------------|---------|
| `DIA(0)` | Hoje | `data = DIA(0)` |
| `DIA(+7)` | Daqui a 7 dias | `vencimento = DIA(+7)` |
| `DIA(-30)` | 30 dias atrás | `criacao = DIA(-30)` |
| `MES(0)` | Este mês | `data = MES(0)` |
| `MES(-1)` | Mês passado | `periodo = MES(-1)` |
| `ANO(0)` | Este ano | `exercicio = ANO(0)` |
| `ULTIMOS DIA(7)` | Últimos 7 dias | `ONDE data ULTIMOS DIA(7)` |
| `ENTRE data1 E data2` | Período | `ENTRE MES(-3) E MES(0)` |

## Tipos de Gráficos
| Tipo | Uso Recomendado | Exemplo |
|------|-----------------|---------|
| `barras` | Comparações | `GRAFICO barras DE vendas_mes` |
| `linha` | Evolução temporal | `GRAFICO linha DE crescimento` |
| `pizza` | Distribuição | `GRAFICO pizza DE vendas POR regiao` |
| `area` | Tendências | `GRAFICO area DE lucro` |
| `gauge` | Medidores/KPI | `GRAFICO gauge DE sla` |
| `scatter` | Correlações | `GRAFICO scatter DE preco, vendas` |
| `heatmap` | Densidade | `GRAFICO heatmap DE atividade` |

## Formatação
| Formato | Uso | Exemplo |
|---------|-----|---------|
| `MOEDA R$` | Valores monetários | `KPI receita MOEDA R$` |
| `FORMATO %` | Percentuais | `KPI crescimento FORMATO %` |
| `FORMATO decimal` | Números decimais | `KPI media FORMATO decimal` |
| `UNIDADE horas` | Unidades específicas | `KPI tempo UNIDADE horas` |

---

## 🎯 DICAS FINAIS

### ✅ Boas Práticas:
1. **Nomes descritivos** para variáveis: `receita_mes_atual` ao invés de `r1`
2. **Comentários** para cálculos complexos: `# Cálculo do ROI do projeto`
3. **Teste gradual**: comece com queries simples, depois complexas
4. **Reutilize variáveis** para cálculos múltiplos
5. **Organize dashboards** por tema/área de negócio

### ⚠️ Evite:
1. **Nomes de campos com espaços** - use underscore: `data_nascimento`
2. **Queries muito longas** - quebre em variáveis menores
3. **Filtros sem sentido** - valide se os campos existem
4. **Dashboards sobrecarregados** - máximo 6-8 widgets por tela

### 🚀 Para ir além:
1. **Combine múltiplas fontes** de dados (Excel + Banco)
2. **Use alertas condicionais** para monitoramento
3. **Crie templates** de dashboards para áreas similares
4. **Compartilhe consultas** úteis com a equipe

---

**📞 Suporte:** Em caso de dúvidas, consulte a documentação técnica ou entre em contato com a equipe TOIT.

**🔄 Versão:** Manual TQL v1.0 - Janeiro 2025

---

*Este manual foi criado para ser seu guia completo no uso da TQL. Pratique com dados reais e explore as possibilidades! 🚀*