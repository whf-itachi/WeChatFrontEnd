/**
 * 格式化日期
 * @param {string|Date} date 日期字符串或Date对象
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
} 