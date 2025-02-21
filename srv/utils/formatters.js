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

function convertDataToUTCZero(date) {
  const data = new Date(date);
  data.setHours(data.getHours() - 3);
  return formatDate(data.toISOString());
}

module.exports = {
  formatDate,
  extractGetTime,
  convertDataToUTCZero
}
