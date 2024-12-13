function formatDate(date) {
  const getTime = new Date(date).getTime()
  return `/Date(${getTime})/`
}

function extractGetTime(date) {
  const match = date.match(/\/Date\((\d+)\+/)
  const timestamp =  match ? match[1] : null

  if (!timestamp) return null

  return new Date(Number(timestamp)).toISOString().slice(0, -5).concat('Z')
}

module.exports = {
  formatDate,
  extractGetTime,
}
