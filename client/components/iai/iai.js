/* global wx, Component */
const MODES = ["tcbService-ai-detectFace"];
import regeneratorRuntime from "../../libs/runtime";
import TcbService from "../../libs/tcb-service-mp-sdk/index";
import { uploadImage } from "./util";
const tcbService = new TcbService();
let imgUrl =
  "https://10.url.cn/eth/ajNVdqHZLLBn1TC6loURIX2GB5GB36NBNZtycXDXKGARFHnJwhHD8URMvyibLIRBTJrdcONEsVHc/";

Component({
  data: {
    fileID: null,
    hasUploaded: false,
    faceRects: [],
    resMap: {
      Gender: {
        label: "性别",
        valMap: { 0: "女", 1: "男" }
      },
      Age: { label: "年龄" },
      Expression: {
        label: "微笑",
        valMap: { 0: "否", 1: "是" }
      },
      Glass: { label: "是否有眼镜" },
      Beauty: { label: "魅力" },
      Hat: { label: "是否有帽子" },
      Mask: { label: "是否有口罩" },
      Score: { label: "质量分" },
      Sharpness: { label: "清晰分" },
      Brightness: { label: "光照分" }
    }
  },

  methods: {
    async handleUploadTap() {
      await this.uploadImage();
    },

    async handleRecognizeTap() {
      await this.callFunction();
    },

    async uploadImage() {
      // 重新上传，清空结果
      this.setData({
        imgUrl,
        faceRects: []
      });
      wx.chooseImage({
        success: dRes => {
          wx.showLoading({
            title: "上传中"
          });

          uploadImage(dRes).then(
            res => {
              this.setData(
                {
                  fileID: res.fileID,
                  hasUploaded: true
                },
                () => {
                  wx.hideLoading();
                }
              );
            },
            (e) => {
              wx.hideLoading();
              wx.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
          );
        }
      });
    },

    async callFunction() {
      wx.showLoading({
        title: "识别中",
        icon: "none"
      });

      let funcName = this.data.mode;
      if (MODES.indexOf(funcName) === -1)
        throw new Error(`未知识别模式: ${funcName}`);

      try {
        let result = await tcbService.callService({
          service: "ai",
          action: funcName,
          data: {
            FileID: this.data.fileID
          }
        });
        wx.hideLoading();

        if (!result.code && result.data) {
          this.setData(
            {
              faceRects: this.getFaceRects(result.data)
            },
            () => {
              this.triggerEvent("finish", result.data);
            }
          );
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

    // 计算人脸位置
    getFaceRects(res) {
      const { ImageWidth, ImageHeight, FaceInfos } = res;
      return FaceInfos.map(item => ({
        ...item,
        rectX: (item.X / ImageWidth) * 100 + "%",
        rectY: (item.Y / ImageHeight) * 100 + "%",
        rectWidth: (item.Width / ImageWidth) * 100 + "%",
        rectHeight: (item.Height / ImageHeight) * 100 + "%"
      }));
    }
  },

  properties: {
    uploadText: {
      type: String,
      value: "上传人脸"
    },
    recognizeText: {
      type: String,
      value: "识别人脸"
    },
    imgUrl: {
      type: String,
      value: imgUrl
    },
    mode: {
      type: String
    }
  }
});
