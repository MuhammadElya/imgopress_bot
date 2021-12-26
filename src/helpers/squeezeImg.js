const axios = require('axios')
const FormData = require('form-data')

async function isLimitExpired() {
  let data;
  try {
    const req = await axios.post('https://squeezeimg.com/api/getinfo', `token=${process.env.SQUEEZEIMG_API_TOKEN}`)
    data = req.data
  } catch (error) {
    console.log(error)
  }
  return data.limit > data.used
}

async function compress(data, filename) {
  const queryData = new FormData();
  queryData.append('token', process.env.SQUEEZEIMG_API_TOKEN);
  queryData.append('file_name', filename);
  queryData.append('qlt', 71);
  queryData.append('method', 'compress');
  queryData.append('file', data, { filename: filename });
  
  return await axios({
    url: 'https://api.squeezeimg.com/plugin',
    method: 'POST',
    data: queryData,
    responseType: 'arraybuffer',
    headers: { ...queryData.getHeaders() } 
  })
}

module.exports = {
  isLimitExpired, compress
}