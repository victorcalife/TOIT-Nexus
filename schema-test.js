// Test if the schema file can be imported without errors
import { tenants, users } from './shared/schema.ts';

console.log('Schema import test:');
console.log('- Tenants table:', !!tenants);
console.log('- Users table:', !!users);
console.log('Schema file imported successfully!');