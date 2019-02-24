const https = require('https')
const cloud = require('wx-server-sdk')
cloud.init()

function get(option) {
  return new Promise((resolve, reject) => {
    https.get(option, (res) => {
      const body = []
      let length = 0

      res.on('data', function (data) {
        length += data.length
        body.push(data)
      })

      res.on('error', function (e) {
        reject(e)
      })

      res.on('end', function () {
        const bodyBuffer = Buffer.concat(body, length)
        resolve(bodyBuffer)
      })
    })
  })
}

module.exports = async (FileId = null, Url = null) => {
  if (FileId) {
    let result = await cloud.downloadFile({
      fileID: FileId
    })

    if (result.fileContent) {
      return result.fileContent.toString('base64')
    }
  }
  else if (Url) {
    let image = await get(Url)
    let imageBase64 = image.toString('base64')
    return imageBase64
  }

  return null
}