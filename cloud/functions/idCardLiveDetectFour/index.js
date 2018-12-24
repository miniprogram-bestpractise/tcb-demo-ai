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
  console.log(event);
  const { video, number, name, idcard } = event;

  let res = await cloud.downloadFile({
    fileID: video
  })

  const buffer = res.fileContent
  // console.log(buffer)

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

  console.log(formData)

  console.log('=================result===========')
  let ret = JSON.parse(result.body)
  console.log(ret)
  console.log(ret.data.live_status)
  console.log(ret.data.live_msg)
  console.log(ret.data.compare_status)
  console.log(ret.data.compare_msg)
  console.log(ret.code)
  console.log(ret.message)

  return {
    data: ret,
    event
  }
}