/**
 * UTILS - FUNÇÕES UTILITÁRIAS
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn( ...inputs )
{
  return twMerge( clsx( inputs ) )
}

/**
 * Formatar CPF
 */
export function formatCPF( cpf )
{
  if ( !cpf ) return ''

  // Remove tudo que não é dígito
  const numbers = cpf.replace( /\D/g, '' )

  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice( 0, 11 )

  // Aplica a formatação
  if ( limitedNumbers.length <= 11 )
  {
    return limitedNumbers
      .replace( /(\d{3})(\d)/, '$1.$2' )
      .replace( /(\d{3})(\d)/, '$1.$2' )
      .replace( /(\d{3})(\d{1,2})/, '$1-$2' )
      .replace( /(-\d{2})\d+?$/, '$1' )
  }

  return limitedNumbers.slice( 0, 11 )
    .replace( /(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4' )
}

/**
 * Formatar CNPJ
 */
export function formatCNPJ( cnpj )
{
  if ( !cnpj ) return ''

  const numbers = cnpj.replace( /\D/g, '' )
  const limitedNumbers = numbers.slice( 0, 14 )

  return limitedNumbers
    .replace( /(\d{2})(\d)/, '$1.$2' )
    .replace( /(\d{3})(\d)/, '$1.$2' )
    .replace( /(\d{3})(\d)/, '$1/$2' )
    .replace( /(\d{4})(\d{1,2})/, '$1-$2' )
    .replace( /(-\d{2})\d+?$/, '$1' )
}

/**
 * Formatar telefone
 */
export function formatPhone( phone )
{
  if ( !phone ) return ''

  const numbers = phone.replace( /\D/g, '' )

  if ( numbers.length <= 10 )
  {
    return numbers
      .replace( /(\d{2})(\d)/, '($1) $2' )
      .replace( /(\d{4})(\d)/, '$1-$2' )
  }

  return numbers
    .replace( /(\d{2})(\d)/, '($1) $2' )
    .replace( /(\d{5})(\d)/, '$1-$2' )
}

/**
 * Validar email
 */
export function isValidEmail( email )
{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test( email )
}

/**
 * Validar CPF
 */
export function isValidCPF( cpf )
{
  if ( !cpf ) return false

  const numbers = cpf.replace( /\D/g, '' )

  if ( numbers.length !== 11 ) return false
  if ( /^(\d)\1{10}$/.test( numbers ) ) return false

  let sum = 0
  for ( let i = 0; i < 9; i++ )
  {
    sum += parseInt( numbers.charAt( i ) ) * ( 10 - i )
  }

  let remainder = ( sum * 10 ) % 11
  if ( remainder === 10 || remainder === 11 ) remainder = 0
  if ( remainder !== parseInt( numbers.charAt( 9 ) ) ) return false

  sum = 0
  for ( let i = 0; i < 10; i++ )
  {
    sum += parseInt( numbers.charAt( i ) ) * ( 11 - i )
  }

  remainder = ( sum * 10 ) % 11
  if ( remainder === 10 || remainder === 11 ) remainder = 0
  if ( remainder !== parseInt( numbers.charAt( 10 ) ) ) return false

  return true
}

/**
 * Gerar ID único
 */
export function generateId()
{
  return Math.random().toString( 36 ).substr( 2, 9 )
}

/**
 * Formatar data
 */
export function formatDate( date, format = 'dd/MM/yyyy' )
{
  if ( !date ) return ''

  const d = new Date( date )
  const day = String( d.getDate() ).padStart( 2, '0' )
  const month = String( d.getMonth() + 1 ).padStart( 2, '0' )
  const year = d.getFullYear()

  return format
    .replace( 'dd', day )
    .replace( 'MM', month )
    .replace( 'yyyy', year )
}

/**
 * Debounce function
 */
export function debounce( func, wait )
{
  let timeout
  return function executedFunction( ...args )
  {
    const later = () =>
    {
      clearTimeout( timeout )
      func( ...args )
    }
    clearTimeout( timeout )
    timeout = setTimeout( later, wait )
  }
}

/**
 * ALIASES PARA COMPATIBILIDADE
 */
export const formatCpf = formatCPF
export const formatCnpj = formatCNPJ
export const cleanCpf = ( cpf ) => cpf?.replace( /\D/g, '' ) || ''
export const cleanCnpj = ( cnpj ) => cnpj?.replace( /\D/g, '' ) || ''
export const validateCpf = isValidCPF
export const validateCnpj = ( cnpj ) =>
{
  const numbers = cnpj?.replace( /\D/g, '' ) || ''
  return numbers.length === 14
}
