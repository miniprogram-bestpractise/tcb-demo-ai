const { ImageClient } = require('image-node-sdk')
const getBase64 = require('./getBase64.js')
const cloud = require('wx-server-sdk')
const config = require('./config');

const imgClient = new ImageClient({
  ...config
})

cloud.init()

exports.main = async (event, context) => {
  let {
    IdCard,
    Name,
    LivenessType = 'LIP',
    ValidateData,
    FileId
  } = event

  let VideoBase64 = await getBase64(FileId)

  try {
    let result = await imgClient
      .init({
        action: 'LivenessRecognition',
        data: {
          IdCard,
          Name,
          VideoBase64: VideoBase64,
          LivenessType,
          ValidateData
        }
      });

    return {
      code: 0,
      data: JSON.parse(result),
      message: 'success'
    }
  }
  catch (e) {
    return { code: 1, message: e.message }
  }

}