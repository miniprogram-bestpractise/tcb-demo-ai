/* global getApp, Page */
import regeneratorRuntime from "../../../libs/runtime";
import { uploadImage } from "../../../components/iai/util";
import { get } from "./util";
import TcbService from "../../../libs/tcb-service-mp-sdk/index";
const tcbService = new TcbService();

Page({
  data: {
    title: "合规检查",
    desc: "上传带有人像的照片，合规检查可以按照证件照的标准判断照片是否合规",
    thumb:
      "https://10.url.cn/eth/ajNVdqHZLLBn1TC6loURIX2GB5GB36NBNZtycXDXKGARFHnJwhHD8URMvyibLIRBTJrdcONEsVHc/",
    // 检查标准
    rule: {
      'FaceAttributesInfo.Hat': {
        label: '是否戴帽子',
        target: false, // 目标值
      },
      'FaceAttributesInfo.Mask': {
        label: '是否戴口罩',
        target: false,
      },
      'FaceQualityInfo.Score': {
        label: '质量分',
        target: 60,
      },
      'FaceQualityInfo.Sharpness': {
        label: '清晰分',
        target: 60,
      },
      'FaceQualityInfo.Brightness': {
        label: '光照分',
        target: [30, 70],
      },
      'FaceQualityInfo.Completeness.Eyebrow': {
        label: '眉毛遮挡分',
        target: 80,
      },
      'FaceQualityInfo.Completeness.Eye': {
        label: '眼镜遮挡分',
        target: 80,
      },
      'FaceQualityInfo.Completeness.Nose': {
        label: '鼻子遮挡分',
        target: 60,
      },
      'FaceQualityInfo.Completeness.Cheek': {
        label: '脸颊遮挡分',
        target: 70,
      },
      'FaceQualityInfo.Completeness.Mouth': {
        label: '嘴巴遮挡分',
        target: 50,
      },
      'FaceQualityInfo.Completeness.Chin': {
        label: '下巴遮挡分',
        target: 70,
      },
    },
    result: null, // 检查结果 true/false
    resultDetail: [], // 详细结果
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
        this.checkCompliance(result.data);
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

  // 分析人像识别的结果
  checkCompliance(res) {
    const _this = this;
    const { ImageWidth, ImageHeight, FaceInfos } = res;
    let face = FaceInfos[0];
    if (!face) return;
    const resultDetail = Object.keys(this.data.rule).reduce((arr, key) => { // 遍历规则
      const ruleItem = this.data.rule[key];
      const value = get(face, key);
      arr.push({
        type: key,
        ...ruleItem,
        compliance: _this.checkRule(value, ruleItem.target),
        value,
      });
      return arr;
    }, []);
    // 结果
    const result = resultDetail.every(e => e.compliance);
    this.setData({
      result,
      resultDetail,
    });
  },

  // 检测某个规则, value: 当前值, ruleTarget: 规则的目标值
  checkRule(value, ruleTarget) {
    const _this = this;
    // isBoolean 与目标值匹配算合规
    if (ruleTarget === true || ruleTarget === false) {
      return Boolean(value) === ruleTarget;
    }
    // isNumber 大于目标值算合规
    else if (typeof ruleTarget === 'number') {
      return value >= ruleTarget;
    }
    // isArray 如果是数组
    else if (Array.isArray(ruleTarget)) {
      if (ruleTarget.length === 2
        && ruleTarget.every(e => typeof e === 'number')) { // 如果是数值数组，则表示值的区间
        return ruleTarget[0] <= value && value <= ruleTarget[1];
      } else { // 如果是其他格式数组，则表示可选的值
        return ruleTarget.some(e => _this.checkRule(e, ruleTarget));
      }
    }
    // 其余情况完全相等算合规
    else {
      return value === ruleTarget;
    }
  }
  
});
