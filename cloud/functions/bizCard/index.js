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
    return JSON.parse(result.body).result_list[0];
};
