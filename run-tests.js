/**
 * EXECUTAR TESTES DO SISTEMA TOIT NEXUS 3.0
 */

import SystemTester from './tests/comprehensive-system-test.js';

console.log('🚀 INICIANDO TESTES DO TOIT NEXUS 3.0...\n');

const tester = new SystemTester();
await tester.runAllTests();
