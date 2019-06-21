/* global getApp, Page */
import { uploadImage } from "../../../components/iai/util";
import regeneratorRuntime from "../../../libs/runtime";
import TcbService from "../../../libs/tcb-service-mp-sdk/index";
import { smoothX, smoothY, kernel } from "./util";
const tcbService = new TcbService();

Page({
  data: {
    title: "隐私保护",
    desc:
      "上传带有人像的照片，隐私保护可以自动的对人像进行模糊处理，从而保护客户隐私",
    containerWidth: 600,
    containerHeight: 0,
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
                  wx.hideLoading();
                  this.recognize();
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
        this.smooth(this.data.temUrl, imgInfo);
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
  smooth(
    url,
    { imageWidth, imageHeight, rectX, rectWidth, rectY, rectHeight }
  ) {
    wx.showLoading({
      title: "绘图中",
      icon: "none"
    });
    wx.getSystemInfo({
      success: res => {
        let pixelRatio = res.pixelRatio;
        let context = wx.createCanvasContext(`canvas`, this);

        // 画布容器高度，单位 rpx
        let containerHeight = Math.floor(
          (imageHeight / imageWidth) * this.data.containerWidth
        );

        // 画布宽高，单位 px
        let canvasWidthPx = Math.floor(
          (res.windowWidth / 750) * this.data.containerWidth
        );
        let canvasHeightPx = Math.floor(
          (res.windowWidth / 750) * containerHeight
        );

        // 人脸的像素位置/大小
        rectX = Math.floor(rectX * canvasWidthPx);
        rectY = Math.floor(rectY * canvasHeightPx);
        rectWidth = Math.floor(rectWidth * canvasWidthPx);
        rectHeight = Math.floor(rectHeight * canvasHeightPx);

        this.setData({ containerHeight }, () => {
          // 绘制原图并缩放充满画布
          context.drawImage(
            url,
            0,
            0,
            imageWidth,
            imageHeight,
            0,
            0,
            canvasWidthPx,
            canvasHeightPx
          );
          context.draw(false, function() {
            // 回调完成后 绘制实际上可能未完成，
            // 导致获取像素不稳定，延时之后再进行下一步
            setTimeout(() => {
              // 获取画布上的像素信息
              wx.canvasGetImageData({
                canvasId: "canvas",
                x: 0,
                y: 0,
                width: canvasWidthPx,
                height: canvasHeightPx,
                success: ({ width, height, data }) => {
                  try {
                    // 对人脸的部分进行高斯平滑，并提取人脸的像素
                    let gKernel = kernel(Math.floor(rectWidth / 15));

                    let smoothData = new Uint8ClampedArray(
                      rectWidth * rectHeight * 4
                    );
                    for (let x = rectX; x < rectX + rectWidth; x++) {
                      for (let y = rectY; y < rectY + rectHeight; y++) {
                        let pointIndex = (x + y * width) * 4;
                        smoothX(
                          pointIndex,
                          gKernel,
                          y * width * 4,
                          ((1 + y) * width - 1) * 4,
                          data
                        );
                      }
                    }
                    for (let x = rectX; x < rectX + rectWidth; x++) {
                      for (let y = rectY; y < rectY + rectHeight; y++) {
                        let pointIndex = (x + y * width) * 4;
                        smoothY(pointIndex, gKernel, width, data);
                      }
                    }
                    for (let x = rectX; x < rectX + rectWidth; x++) {
                      for (let y = rectY; y < rectY + rectHeight; y++) {
                        let pointIndex = (x + y * width) * 4;
                        let smoothIndex =
                          (x - rectX + (y - rectY) * rectWidth) * 4;
                        smoothData[smoothIndex] = data[pointIndex];
                        smoothData[smoothIndex + 1] = data[pointIndex + 1];
                        smoothData[smoothIndex + 2] = data[pointIndex + 2];
                        smoothData[smoothIndex + 3] = data[pointIndex + 3];
                      }
                    }

                    // 将平滑后的人脸像素输出到画布
                    wx.canvasPutImageData({
                      canvasId: "canvas",
                      x: rectX,
                      y: rectY,
                      width: rectWidth,
                      height: rectHeight,
                      data: smoothData,
                      fail: e => {
                        console.log(e);
                      }
                    });
                  } catch (e) {
                    console.log(e);
                  } finally {
                    wx.hideLoading();
                  }
                },
                fail: e => {
                  console.log(e);
                }
              });
            }, 200);
          });
        });
      },
      fail: e => {
        console.log(e);
        wx.hideLoading();
      }
    });
  }
});
