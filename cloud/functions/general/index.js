const { ImageClient } = require('image-node-sdk');
const config = require('./config');

const imgClient = new ImageClient({
  ...config
});

exports.main = async (event) => {
  const imageUrl = event.url;
  const result = await imgClient.ocrGeneral({
      data: {
          url: imageUrl,
      }
  });
    
  const data = JSON.parse(result.body)
  if (!data.code && data.data) {
    return data.data
  }
  else {
    return data
  }
};
