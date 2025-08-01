/**
 * 5️⃣ VISUALIZATION ENGINE - Renderiza widgets e gráficos
 * Suporte completo para 12 tipos de visualização + customização
 */

class VisualizationEngine {
    constructor() {
        this.chartTypes = {
            'barras': this.generateBarChart.bind(this),
            'barras_h': this.generateHorizontalBarChart.bind(this),
            'linha': this.generateLineChart.bind(this),
            'area': this.generateAreaChart.bind(this),
            'pizza': this.generatePieChart.bind(this),
            'rosquinha': this.generateDonutChart.bind(this),
            'gauge': this.generateGaugeChart.bind(this),
            'scatter': this.generateScatterChart.bind(this),
            'heatmap': this.generateHeatmapChart.bind(this),
            'radar': this.generateRadarChart.bind(this),
            'funil': this.generateFunnelChart.bind(this),
            'cascata': this.generateWaterfallChart.bind(this)
        };
        
        this.colorPalettes = {
            'corporativa': ['#2563eb', '#7c3aed', '#059669', '#dc2626', '#ea580c'],
            'semaforo': ['#22c55e', '#eab308', '#ef4444'],
            'moderna': ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
            'azul': ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
            'verde': ['#065f46', '#059669', '#10b981', '#34d399', '#a7f3d0']
        };
        
        console.log('🎨 Visualization Engine inicializado com', Object.keys(this.chartTypes).length, 'tipos de gráfico');
    }
    
    /**
     * Configura visualização baseada no widget
     */
    configure(widget, data) {
        console.log('🎨 Configurando visualização para:', widget.type);
        
        try {
            if (widget.type === 'kpi') {
                return this.configureKPI(widget, data);
            } else if (widget.type === 'chart') {
                return this.configureChart(widget, data);
            } else if (widget.type === 'table') {
                return this.configureTable(widget, data);
            } else if (widget.type === 'gauge') {
                return this.configureGauge(widget, data);
            } else {
                throw new Error(`Tipo de widget não suportado: ${widget.type}`);
            }
        } catch (error) {
            console.error('❌ Erro configurando visualização:', error.message);
            throw error;
        }
    }
    
    /**
     * Configura KPI
     */
    configureKPI(widget, data) {
        console.log('📊 Configurando KPI:', widget.variable);
        
        const config = {
            type: 'kpi',
            value: data.value || 0,
            title: widget.title || widget.variable,
            format: widget.config.format || 'number',
            currency: widget.config.currency || 'R$',
            conditions: widget.config.conditions || [],
            html: this.generateKPIHTML(widget, data)
        };
        
        // Determinar cor baseada nas condições
        config.color = this.evaluateKPIConditions(config.value, config.conditions);
        
        console.log('✅ KPI configurado:', config.title, '=', config.value);
        return config;
    }
    
    /**
     * Configura gráfico
     */
    configureChart(widget, data) {
        console.log('📈 Configurando gráfico:', widget.chartType);
        
        const chartGenerator = this.chartTypes[widget.chartType];
        if (!chartGenerator) {
            throw new Error(`Tipo de gráfico não suportado: ${widget.chartType}`);
        }
        
        const config = {
            type: 'chart',
            chartType: widget.chartType,
            title: widget.title || '',
            data: data,
            colors: this.resolveColors(widget.config.colors || ['corporativa']),
            height: widget.config.height || 400,
            width: widget.config.width || null,
            chartConfig: chartGenerator(data, widget.config),
            html: this.generateChartHTML(widget, data)
        };
        
        console.log('✅ Gráfico configurado:', config.chartType, 'com', data.length, 'pontos');
        return config;
    }
    
    /**
     * Configura tabela
     */
    configureTable(widget, data) {
        console.log('📋 Configurando tabela...');
        
        const config = {
            type: 'table',
            data: data,
            pageSize: widget.config.pageSize || 10,
            sortable: widget.config.sortable !== false,
            searchable: widget.config.searchable !== false,
            html: this.generateTableHTML(widget, data)
        };
        
        console.log('✅ Tabela configurada com', data.length, 'registros');
        return config;
    }
    
    /**
     * Configura gauge
     */
    configureGauge(widget, data) {
        console.log('⚡ Configurando gauge:', widget.variable);
        
        const config = {
            type: 'gauge',
            value: data.value || 0,
            min: widget.config.min || 0,
            max: widget.config.max || 100,
            target: widget.config.target || null,
            thresholds: widget.config.thresholds || [],
            title: widget.title || widget.variable,
            chartConfig: this.generateGaugeChart(data, widget.config),
            html: this.generateGaugeHTML(widget, data)
        };
        
        console.log('✅ Gauge configurado:', config.title, '=', config.value);
        return config;
    }
    
    /**
     * Resolve cores (paleta ou cores específicas)
     */
    resolveColors(colors) {
        if (Array.isArray(colors)) {
            return colors;
        }
        
        if (typeof colors === 'string') {
            return this.colorPalettes[colors] || this.colorPalettes['corporativa'];
        }
        
        return this.colorPalettes['corporativa'];
    }
    
    /**
     * Avalia condições de cor para KPI
     */
    evaluateKPIConditions(value, conditions) {
        for (const condition of conditions) {
            if (this.evaluateCondition(value, condition.condition)) {
                return condition.color;
            }
        }
        return 'primary'; // Cor padrão
    }
    
    /**
     * Avalia condição individual
     */
    evaluateCondition(value, condition) {
        // Condições como: ">0", "<=80", ">=95"
        if (condition.includes('>')) {
            const threshold = parseFloat(condition.replace('>', ''));
            return condition.includes('=') ? value >= threshold : value > threshold;
        } else if (condition.includes('<')) {
            const threshold = parseFloat(condition.replace('<', '').replace('=', ''));
            return condition.includes('=') ? value <= threshold : value < threshold;
        } else if (condition.includes('=')) {
            const threshold = parseFloat(condition.replace('=', ''));
            return value === threshold;
        }
        
        return false;
    }
    
    /**
     * GERADORES DE GRÁFICOS
     */
    
    /**
     * Gráfico de barras verticais
     */
    generateBarChart(data, config) {
        console.log('📊 Gerando gráfico de barras...');
        
        return {
            type: 'bar',
            data: {
                labels: data.map(d => d.label || d.x),
                datasets: [{
                    data: data.map(d => d.value || d.y),
                    backgroundColor: this.resolveColors(config.colors || ['corporativa']),
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: !!config.title,
                        text: config.title
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        };
    }
    
    /**
     * Gráfico de barras horizontais
     */
    generateHorizontalBarChart(data, config) {
        const barConfig = this.generateBarChart(data, config);
        barConfig.type = 'bar';
        barConfig.options.indexAxis = 'y';
        return barConfig;
    }
    
    /**
     * Gráfico de linha
     */
    generateLineChart(data, config) {
        console.log('📈 Gerando gráfico de linha...');
        
        return {
            type: 'line',
            data: {
                labels: data.map(d => d.label || d.x),
                datasets: [{
                    data: data.map(d => d.value || d.y),
                    borderColor: this.resolveColors(config.colors || ['corporativa'])[0],
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointBackgroundColor: this.resolveColors(config.colors || ['corporativa'])[0],
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        };
    }
    
    /**
     * Gráfico de área
     */
    generateAreaChart(data, config) {
        const lineConfig = this.generateLineChart(data, config);
        lineConfig.data.datasets[0].fill = true;
        lineConfig.data.datasets[0].backgroundColor = this.resolveColors(config.colors || ['corporativa'])[0] + '20'; // 20% opacity
        return lineConfig;
    }
    
    /**
     * Gráfico pizza
     */
    generatePieChart(data, config) {
        console.log('🥧 Gerando gráfico pizza...');
        
        return {
            type: 'pie',
            data: {
                labels: data.map(d => d.label || d.x),
                datasets: [{
                    data: data.map(d => d.value || d.y),
                    backgroundColor: this.resolveColors(config.colors || ['corporativa']),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        };
    }
    
    /**
     * Gráfico rosquinha (donut)
     */
    generateDonutChart(data, config) {
        const pieConfig = this.generatePieChart(data, config);
        pieConfig.type = 'doughnut';
        pieConfig.options.cutout = '60%';
        return pieConfig;
    }
    
    /**
     * Gráfico gauge/velocímetro
     */
    generateGaugeChart(data, config) {
        console.log('⚡ Gerando gauge...');
        
        const value = data.value || 0;
        const min = config.min || 0;
        const max = config.max || 100;
        const percentage = ((value - min) / (max - min)) * 100;
        
        return {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [
                        this.getGaugeColor(percentage),
                        '#e5e7eb'
                    ],
                    borderWidth: 0,
                    cutout: '80%',
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        };
    }
    
    /**
     * Gráfico scatter (dispersão)
     */
    generateScatterChart(data, config) {
        console.log('🎯 Gerando scatter chart...');
        
        return {
            type: 'scatter',
            data: {
                datasets: [{
                    data: data.map(d => ({ x: d.x, y: d.y })),
                    backgroundColor: this.resolveColors(config.colors || ['corporativa'])[0],
                    borderColor: this.resolveColors(config.colors || ['corporativa'])[0],
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }
    
    /**
     * Heatmap
     */
    generateHeatmapChart(data, config) {
        console.log('🔥 Gerando heatmap...');
        
        // Para heatmap, usar biblioteca específica (Chart.js não tem nativo)
        return {
            type: 'heatmap',
            data: data,
            config: {
                colors: this.resolveColors(config.colors || ['azul']),
                showValues: true,
                cellSize: 20
            }
        };
    }
    
    /**
     * Radar chart
     */
    generateRadarChart(data, config) {
        console.log('🎯 Gerando radar chart...');
        
        return {
            type: 'radar',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.value),
                    borderColor: this.resolveColors(config.colors || ['corporativa'])[0],
                    backgroundColor: this.resolveColors(config.colors || ['corporativa'])[0] + '20',
                    pointBackgroundColor: this.resolveColors(config.colors || ['corporativa'])[0],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        };
    }
    
    /**
     * Funil
     */
    generateFunnelChart(data, config) {
        console.log('🔽 Gerando funnel chart...');
        
        // Funil usando barras horizontais com larguras decrescentes
        return {
            type: 'funnel',
            data: data,
            config: {
                colors: this.resolveColors(config.colors || ['corporativa']),
                showValues: true,
                showPercentages: true
            }
        };
    }
    
    /**
     * Waterfall (cascata)
     */
    generateWaterfallChart(data, config) {
        console.log('💧 Gerando waterfall chart...');
        
        return {
            type: 'waterfall',
            data: data,
            config: {
                positiveColor: '#22c55e',
                negativeColor: '#ef4444',
                totalColor: '#3b82f6',
                showConnectors: true
            }
        };
    }
    
    /**
     * GERADORES DE HTML
     */
    
    /**
     * Gera HTML para KPI
     */
    generateKPIHTML(widget, data) {
        const value = data.value || 0;
        const formattedValue = this.formatValue(value, widget.config);
        const color = this.evaluateKPIConditions(value, widget.config.conditions);
        
        return `
        <div class="kpi-widget" data-widget-id="${widget.id}">
            <div class="kpi-title">${widget.title}</div>
            <div class="kpi-value kpi-color-${color}">
                ${formattedValue}
            </div>
            <div class="kpi-trend">
                <!-- Trend indicator aqui -->
            </div>
        </div>`;
    }
    
    /**
     * Gera HTML para gráfico
     */
    generateChartHTML(widget, data) {
        return `
        <div class="chart-widget" data-widget-id="${widget.id}">
            <div class="chart-header">
                <h3>${widget.title || ''}</h3>
            </div>
            <div class="chart-container">
                <canvas id="chart-${widget.id}" 
                        width="${widget.config.width || 600}" 
                        height="${widget.config.height || 400}">
                </canvas>
            </div>
        </div>`;
    }
    
    /**
     * Gera HTML para tabela
     */
    generateTableHTML(widget, data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '<div class="table-widget empty">Nenhum dado disponível</div>';
        }
        
        const headers = Object.keys(data[0]);
        
        let html = `
        <div class="table-widget" data-widget-id="${widget.id}">
            <div class="table-header">
                <input type="text" placeholder="Buscar..." class="table-search">
            </div>
            <table class="data-table">
                <thead>
                    <tr>`;
        
        headers.forEach(header => {
            html += `<th data-sort="${header}">${header}</th>`;
        });
        
        html += `</tr></thead><tbody>`;
        
        data.forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                html += `<td>${row[header] || ''}</td>`;
            });
            html += '</tr>';
        });
        
        html += `</tbody></table></div>`;
        
        return html;
    }
    
    /**
     * Gera HTML para gauge
     */
    generateGaugeHTML(widget, data) {
        const value = data.value || 0;
        const formattedValue = this.formatValue(value, widget.config);
        
        return `
        <div class="gauge-widget" data-widget-id="${widget.id}">
            <div class="gauge-title">${widget.title}</div>
            <div class="gauge-container">
                <canvas id="gauge-${widget.id}" width="200" height="120"></canvas>
                <div class="gauge-value">${formattedValue}</div>
            </div>
        </div>`;
    }
    
    /**
     * UTILITÁRIOS
     */
    
    /**
     * Formata valor baseado na configuração
     */
    formatValue(value, config) {
        if (config.format === 'currency') {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: config.currency === 'R$' ? 'BRL' : 'USD'
            }).format(value);
        } else if (config.format === 'percentage') {
            return `${value.toFixed(1)}%`;
        } else if (config.format === 'decimal') {
            return value.toFixed(2);
        } else {
            return new Intl.NumberFormat('pt-BR').format(Math.round(value));
        }
    }
    
    /**
     * Determina cor do gauge baseada no valor
     */
    getGaugeColor(percentage) {
        if (percentage >= 80) return '#22c55e'; // Verde
        if (percentage >= 60) return '#eab308'; // Amarelo
        if (percentage >= 40) return '#f59e0b'; // Laranja
        return '#ef4444'; // Vermelho
    }
    
    /**
     * Gera CSS para widgets
     */
    generateWidgetCSS() {
        return `
        .kpi-widget {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .kpi-title {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .kpi-value {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
        }
        
        .kpi-color-verde { color: #22c55e; }
        .kpi-color-amarelo { color: #eab308; }
        .kpi-color-vermelho { color: #ef4444; }
        .kpi-color-azul { color: #3b82f6; }
        .kpi-color-primary { color: #1e293b; }
        
        .chart-widget {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .chart-header h3 {
            margin: 0 0 16px 0;
            font-size: 18px;
            color: #1e293b;
        }
        
        .table-widget {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .data-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        
        .gauge-widget {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .gauge-container {
            position: relative;
        }
        
        .gauge-value {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
        }`;
    }
}

module.exports = { VisualizationEngine };