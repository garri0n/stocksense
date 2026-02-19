// utils/currency.js
export const CURRENCY = {
  symbol: '₱',
  code: 'PHP',
  name: 'Philippine Peso'
}

export const formatPrice = (price) => {
  if (price === undefined || price === null) return `${CURRENCY.symbol}0.00`
  
  return `${CURRENCY.symbol}${parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}