const https = require('https');
const { ImageClient } = require('image-node-sdk');
const config = require('./config');

let imgClient = new ImageClient({
  ...config
});

function get(option) {
    return new Promise((resolve, reject) => {
        https.get(option, (res) => {
            const body = [];
            let length = 0;

            res.on('data', function (data) {
                length += data.length
                body.push(data);
            })

            res.on('end', function () {
                const bodyBuffer = Buffer.concat(body, length)
                resolve(bodyBuffer)
            })
        });
    });
}

exports.main = async (event) => {
  const imageUrl = event.url
  const image = await get(imageUrl)
  const imageBase64 = image.toString('base64')

  try {
    const result = await imgClient.faceFuse({
        data: {
          uin: event.uin || config.uin || '',
          project_id: event.project_id || config.project_id || '',
          model_id: event.model_id || config.model_id || '',
          img_data: imageBase64,
          rsp_img_type: 'url'
        },
    })

    return JSON.parse(result)
  }
  catch (e) {
    return {code: 1, message: e.message}
  }
};
