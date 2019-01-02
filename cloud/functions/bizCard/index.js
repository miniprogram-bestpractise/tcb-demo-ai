const { ImageClient } = require('image-node-sdk');
const config = require('./config');

const imgClient = new ImageClient({
  ...config
});

exports.main = async (event) => {
  const idCardImageUrl = event.url;
  const result = await imgClient.ocrBizCard({
      data: {
          url_list: [idCardImageUrl],
      },
  });

  const data = JSON.parse(result.body)

  if (!data.code && data.result_list.length) {
    return data.result_list[0]
  }
  else {
    return data
  }
};
