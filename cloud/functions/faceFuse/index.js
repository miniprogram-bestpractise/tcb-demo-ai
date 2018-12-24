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
                length += data.length;
                body.push(data);
            });

            res.on('end', function () {
                const bodyBuffer = Buffer.concat(body, length);
                resolve(bodyBuffer);
            });
        });
    });
}

exports.main = async (event) => {
    const imageUrl = event.url;
    const image = await get(imageUrl);
    const imageBase64 = image.toString('base64');
    const result = await imgClient.faceFuse({
        data: {
<<<<<<< HEAD
          uin: event.uin || config.uin || '',
          project_id: event.project_id || config.project_id || '',
          model_id: event.model_id || config.model_id || '',
          img_data: imageBase64,
          rsp_img_type: 'url'
=======
            uin: '',
            project_id: '',
            model_id: '',
            img_data: imageBase64,
            rsp_img_type: 'url'
>>>>>>> 37ff5433cab98c2b2159c4a7394249916ac11c48
        },
    });
    return JSON.parse(result.body);
};
