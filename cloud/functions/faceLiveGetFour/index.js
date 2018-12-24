// 云函数入口文件
const { ImageClient } = require('image-node-sdk')
const cloud = require('wx-server-sdk')
const config = require('./config');

const imgClient = new ImageClient({
  ...config
})

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
  const result = await imgClient.faceLiveGetFour({})

  return JSON.parse(result.body).data
}