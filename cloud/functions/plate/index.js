const { ImageClient } = require('image-node-sdk');
const config = require('./config');

const imgClient = new ImageClient({
  ...config
});

exports.main = async (event) => {
    const imageUrl = event.url;
    const result = await imgClient.ocrPlate({
        data: {
            url: imageUrl,
        }
    });
    return JSON.parse(result.body).data;
};
