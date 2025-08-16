/**
 * TOIT NEXUS - QUANTUM API TESTER
 * Teste das APIs quânticas do sistema
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Configuração de timeout
const API_TIMEOUT = 10000;

async function testQuantumAPIs() {
    console.log('QUANTUM API TESTER');
    console.log('==================');
    console.log('Testando APIs quanticas do TOIT NEXUS...\n');
    
    const endpoints = [
        {
            url: '/api/quantum/status',
            method: 'GET',
            description: 'Status do sistema quantico'
        },
        {
            url: '/api/quantum/activate',
            method: 'POST',
            description: 'Ativacao do sistema quantico'
        },
        {
            url: '/api/native-quantum/status',
            method: 'GET',
            description: 'Status do motor quantico nativo'
        },
        {
            url: '/api/real-quantum/health',
            method: 'GET',
            description: 'Health check IBM Quantum'
        },
        {
            url: '/api/quantum-ml/status',
            method: 'GET',
            description: 'Status ML quantico'
        },
        {
            url: '/api/quantum-commercial/status',
            method: 'GET',
            description: 'Status modulos comerciais'
        },
        {
            url: '/api/quantum-billing/status',
            method: 'GET',
            description: 'Status billing quantico'
        }
    ];
    
    let successCount = 0;
    let totalTests = endpoints.length;
    
    for (const endpoint of endpoints) {
        try {
            console.log(`TESTING ${endpoint.url}...`);
            console.log(`DESC: ${endpoint.description}`);
            
            const config = {
                method: endpoint.method,
                url: `${BASE_URL}${endpoint.url}`,
                timeout: API_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                }
            };
            
            if (endpoint.method === 'POST') {
                config.data = { test: true };
            }
            
            const response = await axios(config);
            
            if (response.status === 200) {
                console.log(`OK ${endpoint.url} - Status 200`);
                if (response.data) {
                    console.log(`DATA: ${JSON.stringify(response.data, null, 2)}`);
                }
                successCount++;
            } else {
                console.log(`WARNING ${endpoint.url} - Status ${response.status}`);
            }
            
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`WARNING ${endpoint.url} - Servidor nao esta rodando`);
                console.log('INFO: Inicie o servidor com: npm run dev');
            } else if (error.response?.status === 401) {
                console.log(`OK ${endpoint.url} - Requer autenticacao (esperado)`);
                successCount++;
            } else if (error.response?.status === 404) {
                console.log(`WARNING ${endpoint.url} - Endpoint nao encontrado`);
            } else if (error.response?.status === 500) {
                console.log(`ERROR ${endpoint.url} - Erro interno do servidor`);
                if (error.response.data) {
                    console.log(`ERROR_DATA: ${JSON.stringify(error.response.data, null, 2)}`);
                }
            } else {
                console.log(`ERROR ${endpoint.url} - ${error.message}`);
            }
        }
        
        console.log(''); // Linha em branco
    }
    
    console.log('RESULTS');
    console.log('=======');
    console.log(`Testes executados: ${totalTests}`);
    console.log(`Sucessos: ${successCount}`);
    console.log(`Falhas: ${totalTests - successCount}`);
    console.log(`Taxa de sucesso: ${Math.round((successCount / totalTests) * 100)}%`);
    
    if (successCount === 0) {
        console.log('\nWARNING: Nenhum endpoint respondeu corretamente');
        console.log('SOLUTION: Verifique se o servidor esta rodando:');
        console.log('  1. cd server');
        console.log('  2. npm run dev');
        console.log('  3. Execute este teste novamente');
    } else if (successCount === totalTests) {
        console.log('\nSUCCESS: Todos os endpoints quanticos estao funcionando!');
        console.log('READY: Sistema quantico pronto para uso');
    } else {
        console.log('\nPARTIAL: Alguns endpoints estao funcionando');
        console.log('ACTION: Verifique os endpoints com falha');
    }
}

async function testQuantumOperations() {
    console.log('\nQUANTUM OPERATIONS TEST');
    console.log('=======================');
    
    const operations = [
        {
            url: '/api/native-quantum/optimize',
            method: 'POST',
            data: {
                problem: {
                    type: 'optimization',
                    variables: [1, 2, 3, 4, 5],
                    constraints: { max_value: 10 }
                }
            },
            description: 'Otimizacao quantica'
        },
        {
            url: '/api/native-quantum/search',
            method: 'POST',
            data: {
                query: 'test search',
                dataset: ['item1', 'item2', 'item3'],
                options: { limit: 10 }
            },
            description: 'Busca quantica'
        },
        {
            url: '/api/quantum-ml/predict',
            method: 'POST',
            data: {
                data: [0.1, 0.2, 0.3, 0.4, 0.5],
                model: 'quantum_neural_network',
                options: { confidence_threshold: 0.8 }
            },
            description: 'Predicao ML quantica'
        }
    ];
    
    for (const operation of operations) {
        try {
            console.log(`TESTING ${operation.url}...`);
            console.log(`DESC: ${operation.description}`);
            
            const response = await axios({
                method: operation.method,
                url: `${BASE_URL}${operation.url}`,
                data: operation.data,
                timeout: API_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                }
            });
            
            if (response.status === 200) {
                console.log(`OK ${operation.url} - Operacao executada`);
                if (response.data?.result) {
                    console.log(`RESULT: ${JSON.stringify(response.data.result, null, 2)}`);
                }
            }
            
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`WARNING ${operation.url} - Servidor nao esta rodando`);
            } else if (error.response?.status === 401) {
                console.log(`OK ${operation.url} - Requer autenticacao`);
            } else {
                console.log(`ERROR ${operation.url} - ${error.message}`);
            }
        }
        
        console.log('');
    }
}

async function testQuantumBilling() {
    console.log('\nQUANTUM BILLING TEST');
    console.log('====================');
    
    const billingTests = [
        {
            url: '/api/quantum-billing/usage',
            method: 'GET',
            description: 'Uso quantico atual'
        },
        {
            url: '/api/quantum-billing/credits',
            method: 'GET',
            description: 'Creditos quanticos disponiveis'
        },
        {
            url: '/api/quantum-commercial/tiers',
            method: 'GET',
            description: 'Tiers comerciais disponiveis'
        }
    ];
    
    for (const test of billingTests) {
        try {
            console.log(`TESTING ${test.url}...`);
            
            const response = await axios({
                method: test.method,
                url: `${BASE_URL}${test.url}`,
                timeout: API_TIMEOUT,
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            
            if (response.status === 200) {
                console.log(`OK ${test.url} - ${test.description}`);
            }
            
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`WARNING ${test.url} - Servidor nao esta rodando`);
            } else {
                console.log(`ERROR ${test.url} - ${error.message}`);
            }
        }
        
        console.log('');
    }
}

async function main() {
    console.log('TOIT NEXUS - QUANTUM SYSTEM API TESTER');
    console.log('=======================================');
    console.log('Iniciando testes completos das APIs quanticas...\n');
    
    try {
        // Teste básico de APIs
        await testQuantumAPIs();
        
        // Teste de operações quânticas
        await testQuantumOperations();
        
        // Teste de billing quântico
        await testQuantumBilling();
        
        console.log('\nTEST COMPLETE');
        console.log('=============');
        console.log('Todos os testes foram executados.');
        console.log('Verifique os resultados acima para identificar problemas.');
        
    } catch (error) {
        console.error('FATAL ERROR:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testQuantumAPIs,
    testQuantumOperations,
    testQuantumBilling
};
