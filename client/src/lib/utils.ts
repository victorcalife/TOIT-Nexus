import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Aplica máscara no CPF formatando como 123.456.789-10
 * @param value - String com números do CPF
 * @returns CPF formatado com máscara
 */
export function formatCpf(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a formatação CPF: 123.456.789-01
  if (limitedNumbers.length <= 11) {
    return limitedNumbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }
  
  return limitedNumbers.slice(0, 11)
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove a máscara do CPF retornando apenas números  
 * @param cpf - CPF formatado ou não
 * @returns String com apenas os números do CPF
 */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Valida se o CPF é válido usando o algoritmo oficial
 * @param cpf - CPF com ou sem máscara
 * @returns true se CPF for válido, false caso contrário
 */
export function validateCpf(cpf: string): boolean {
  // Remove caracteres não numéricos
  const numbers = cleanCpf(cpf);
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPFs inválidos)
  if (/^(\d)\1{10}$/.test(numbers)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers.charAt(9)) !== firstDigit) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers.charAt(10)) !== secondDigit) {
    return false;
  }
  
  return true;
}
