/**
 * Formatea una fecha ISO en formato DD.MM.YYYY
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

/**
 * Formatea una fecha ISO en formato DD/MM/YYYY
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
export const formatDateSlash = (isoDate) => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha ISO en un formato más legible en español
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
export const formatDateLong = (isoDate) => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  
  if (isNaN(date.getTime())) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC'
  };
  
  return date.toLocaleDateString('es-ES', options);
};
