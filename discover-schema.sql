-- Script para descobrir o schema real das tabelas no Railway PostgreSQL
-- Execute este script PRIMEIRO para ver quais colunas existem

-- 1. DESCOBRIR COLUNAS DA TABELA TENANTS
DO $$
BEGIN
    RAISE NOTICE '=== SCHEMA DA TABELA TENANTS ===';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tenants'
ORDER BY ordinal_position;

-- 2. DESCOBRIR COLUNAS DA TABELA USERS  
DO $$
BEGIN
    RAISE NOTICE '=== SCHEMA DA TABELA USERS ===';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. LISTAR TODAS AS TABELAS EXISTENTES
DO $$
BEGIN
    RAISE NOTICE '=== TODAS AS TABELAS EXISTENTES ===';
END $$;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. DESCOBRIR ENUMS EXISTENTES
DO $$
BEGIN
    RAISE NOTICE '=== ENUMS EXISTENTES ===';
END $$;

SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- 5. VERIFICAR SE TABELAS EXISTEM
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as tenants_table,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as users_table,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'departments') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as departments_table,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as clients_table;