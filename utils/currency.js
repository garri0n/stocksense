// utils/currency.js
// Currency configuration for the entire app
export const CURRENCY = {
  symbol: '₱',
  code: 'PHP',
  name: 'Philippine Peso'
}

// Format price with Philippine Peso symbol
export const formatPrice = (price) => {
  if (price === undefined || price === null) return `${CURRENCY.symbol}0.00`
  
  // Convert USD to PHP (approximate conversion rate: 1 USD = 56 PHP)
  // You can adjust this rate or remove the conversion if your prices are already in PHP
  const phpPrice = parseFloat(price) * 56
  
  return `${CURRENCY.symbol}${phpPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// Format price without conversion (if prices are already in PHP)
export const formatPricePHP = (price) => {
  if (price === undefined || price === null) return `${CURRENCY.symbol}0.00`
  
  return `${CURRENCY.symbol}${parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// Convert USD to PHP (helper function)
export const usdToPhp = (usdAmount, rate = 56) => {
  return usdAmount * rate
}