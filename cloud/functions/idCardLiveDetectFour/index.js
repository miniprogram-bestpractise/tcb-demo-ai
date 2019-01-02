// 云函数入口文件
const { ImageClient } = require('image-node-sdk')
const cloud = require('wx-server-sdk')
const config = require('./config');

const imgClient = new ImageClient({
  ...config
})

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const { openid } = cloud.getWXContext()
  const { video, number, name, idcard } = event;

  let res = await cloud.downloadFile({
    fileID: video
  })

  const buffer = res.fileContent

  let formData = {
    validate_data: number,
    video: buffer,
    idcard_number: idcard,
    idcard_name: name
  }

  const result = await imgClient.faceIdCardLiveDetectFour({
    headers: {
      "content-type": "multipart/form-data"
    },
    formData,
  });


  let ret = JSON.parse(result.body)

  return ret
}