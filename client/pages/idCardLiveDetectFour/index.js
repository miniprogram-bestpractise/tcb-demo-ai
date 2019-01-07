const regeneratorRuntime = require('../../libs/runtime')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRecording: false,
    buttonType: 'primary',
    action: '录制',
    number: '',
    src: null, // 'cloud://tcb-advanced-a656fc.7463-tcb-advanced-a656fc/1545643360463.mp4',
    name: '',
    idcard: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {},
  

  async generateNumber() {
    wx.showLoading({
      mask: true
    })

    let { result } = await wx.cloud.callFunction({
      name: 'faceLiveGetFour'
    })

    console.log(result)

    if (result.validate_data) {
      this.setData({
        number: result.validate_data
      }, () => {
        wx.hideLoading()
      })
    }
    else {
      wx.hideLoading()
      wx.showToast({
        title: '获取数字失败，请重试',
        icon: 'none'
      })
    }
    
  },

  toggleRecord() {
    let isRecording = !this.data.isRecording
    let buttonType = (isRecording) ? 'warn' : 'primary'
    this.setData({
      isRecording,
      buttonType,
      action: (isRecording) ? '完成' : '录制',
      src: isRecording ? null : this.data.src
    }, () => {
      if (!isRecording) {
        this.stopRecord()
      }
      else {
        this.takeRecord()
      }
    })
  },

  async takeRecord() {
    
    await this.generateNumber()

    this.ctx = wx.createCameraContext()
    this.ctx.startRecord({
      success(res) {
        console.log(res);
      },
      fail() {
        wx.showToast({
          title: '打开摄像头失败',
          icon: 'none'
        })
      }
    })
  },

  stopRecord() {
    this.ctx.stopRecord({
      success: async (res) => {
        console.log('====video path=====')
        console.log(res.tempVideoPath);
        
        wx.showLoading({
          title: '上传中',
          mask: true
        })
        
        try {
          let result = await wx.cloud.uploadFile({
            cloudPath: Date.now() + '.mp4',
            filePath: res.tempVideoPath, // 小程序临时文件路径
          })

          console.log(result);
          if (!result.fileID) {
            throw new Error(result.errMsg);
          }

          this.setData({
            src: result.fileID
          }, () => {
            wx.hideLoading()
          })
        }
        catch (e) {
          wx.hideLoading()
          wx.showToast({
            title: '录制失败，请重试',
            icon: 'none'
          })
        }
        
      },

      fail() {
        wx.showToast({
          title: '录制失败，请重试',
          icon: 'none'
        })
      }
    });
  },

  async submit() {
    try {
      wx.showLoading({
        title: '验证中',
        icon: 'none'
      })

      let { number, src, name, idcard } = this.data

      if (!name || !idcard) {
        wx.hideLoading()
        wx.showToast({
          title: '姓名和身份证不能为空',
          icon: 'none'
        })
      }

      let { result } = await wx.cloud.callFunction({
        name: 'idCardLiveDetectFour',
        data: {
          number: number,
          video: src,
          name: name,
          idcard: idcard
        }
      })

      wx.hideLoading()
      if (!result.code && !result.data.compare_status) {
        wx.showToast({
          title: '验证成功',
          mask: true
        })
      }
      else {
        throw new Error('验证失败')
      }
      
    }
    catch(e) {
      wx.hideLoading()
      wx.showToast({
        title: '验证失败',
        icon: 'none',
        mask: true
      })
    }

  },
  
  error(e) {
    console.log(e.detail)
  },

  getName(e) {
    this.setData({
      name: e.detail.value
    })
  },

  getIdCard(e) {
    this.setData({
      idcard: e.detail.value
    })
  }
})