/* global getApp, Page */
import { uploadImage } from "../../../components/iai/util";
import regeneratorRuntime from "../../../libs/runtime";
import TcbService from "../../../libs/tcb-service-mp-sdk/index";
const tcbService = new TcbService();
Page({
  data: {
    title: "智能裁剪",
    desc:
      "上传带有人像的照片，智能裁剪可以防止人像被切割，从而获得更好的缩略图体验",
    clipSizes: [[100, 100], [300, 200], [160, 90]],
    thumb:
      "https://10.url.cn/eth/ajNVdqHZLLBn1TC6loURIX2GB5GB36NBNZtycXDXKGARFHnJwhHD8URMvyibLIRBTJrdcONEsVHc/"
  },
  handleFinish(e) {
    if (!e.detail) {
      return;
    }
    console.log(e.detail);
  },
  handleUploadTap() {
    let _this = this;
    wx.chooseImage({
      success: dRes => {
        wx.showLoading({
          title: "上传中"
        });
        this.setData({ temUrl: dRes.tempFilePaths[0] });

        uploadImage(dRes)
          .then(
            res => {
              _this.setData(
                {
                  fileID: res.fileID
                },
                async () => {
                  this.recognize();
                  wx.hideLoading();
                }
              );
            },
            e => {
              console.log(e);
              wx.hideLoading();
              wx.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
          )
          .catch(e => {
            console.log(e);
          });
      }
    });
  },
  async recognize() {
    wx.showLoading({
      title: "识别中",
      icon: "none"
    });

    try {
      let result = await tcbService.callService({
        service: "ai",
        action: "tcbService-ai-detectFace",
        data: {
          FileID: this.data.fileID
        }
      });
      wx.hideLoading();

      if (!result.code && result.data) {
        let imgInfo = this.getFaceRect(result.data);
        this.clip(this.data.temUrl, imgInfo);
      } else {
        throw result;
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({
        title: "识别失败",
        icon: "none"
      });
      console.log(e);
    }
  },
  getFaceRect(res) {
    const { ImageWidth, ImageHeight, FaceInfos } = res;
    let face = FaceInfos[0];
    return {
      imageWidth: ImageWidth,
      imageHeight: ImageHeight,
      rectX: face.X / ImageWidth,
      rectY: face.Y / ImageHeight,
      rectWidth: face.Width / ImageWidth,
      rectHeight: face.Height / ImageHeight
    };
  },
  clip(url, { imageWidth, imageHeight, rectX, rectWidth, rectY, rectHeight }) {
    let minWidth = Math.max(
      ...this.data.clipSizes.map(([width, height]) => {
        return width;
      })
    );
    let minHeight = Math.max(
      ...this.data.clipSizes.map(([width, height]) => {
        return height;
      })
    );
    if (imageWidth < minWidth || imageWidth < minHeight) {
      wx.showToast({
        title: `请选择 宽度 >= ${minWidth}px，高度 >= ${minHeight}px 的图片`,
        icon: "none"
      });
      return;
    }

    this.data.clipSizes.forEach(([clipWidth, clipHeight]) => {
      let middleWidth = rectX + rectWidth / 2;
      let middleHeight = rectY + rectHeight / 2;
      let clipAspectRatio = clipWidth / clipHeight;
      let imageAspectRatio = imageWidth / imageHeight;
      let top = 0,
        left = 0;
      let right = 1,
        bottom = 1;
      if (imageAspectRatio < clipAspectRatio) {
        // 宽边对齐，上下移动
        let halfHeight = imageAspectRatio / clipAspectRatio / 2;
        top = middleHeight - halfHeight;
        bottom = middleHeight + halfHeight;
        if (top < 0) {
          bottom = halfHeight * 2;
          top = 0;
        } else if (bottom > 1) {
          top = 1 - halfHeight * 2;
          bottom = 1;
        }
      } else {
        // 高边对齐，左右移动
        let halfWidth = clipAspectRatio / imageAspectRatio / 2;
        left = middleWidth - halfWidth;
        right = middleWidth + halfWidth;
        if (left < 0) {
          right += -left;
          left = 0;
        } else if (right > 1) {
          left = 1 - right + left;
          right = 1;
        }
      }
      wx.getSystemInfo({
        success: function(res) {
          let context = wx.createCanvasContext(`canvas-${clipAspectRatio}`);
          context.drawImage(
            url,
            Math.floor(left * imageWidth),
            Math.floor(top * imageHeight),
            Math.floor((right - left) * imageWidth),
            Math.floor((bottom - top) * imageHeight),
            0,
            0,
            (res.windowWidth / 750) * clipWidth,
            (res.windowWidth / 750) * clipHeight
          );
          context.draw(false);
        }
      });
    });
  }
});
