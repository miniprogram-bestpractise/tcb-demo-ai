# 小程序·云开发AI智能图像解决方案

基于小程序云开发的 AI DEMO，使用腾讯云智能图像服务

## 注意事项
- 教程在：[小程序·云开发系列教程](https://github.com/TencentCloudBase/mp-book)
- 打开的时候记得填写 `project.config.json` 中的 `appid` 字段，其它功能的试用，请参考教程里的[小程序中级场景及开发教学](https://github.com/TencentCloudBase/mp-book/blob/master/medium-tutorial/ai.md) 进行配置试用。

## 体验

敬请期待

## 使用组件

如果你想使用小程序 AI 自定义组件，你可以按照以下步骤进行。

### 复制并使用自定义 AI 组件
将 `client/components/` 中其中一个组件复制到你的项目中的组件存放位置（`lib` 目录也需要复制，因为用到了 `weui` 的样式)，在页面的 `json` 文件中进行引用声明。

```json
{
    "usingComponents": {
        "ocr": "path/to/ocr"
    }
}
```

然后在页面 `wxml` 文件中使用组件，具体参数，见下节的 API 文档


```xml
<ocr
    uploadText="上传图片"
    recognizeText="进行识别"
    mode="general"
    imgUrl="https://10.url.cn/eth/ajNVdqHZLLBn1TC6loURIX2GB5GB36NBNZtycXDXKGARFHnJwhHD8URMvyibLIRBTJrdcONEsVHc/"
    bindfinish="handleFinish"
/>
```

### 复制并上传云函数

了解你具体想使用哪个 `AI` 功能，然后把相关的云函数目录，复制到你的项目中的指定云函数目录下。该目录可以在 `project.config.json` 中配置 `cloudfunctionRoot`。复制后，请安装依赖并右键上传云函数。
    
`project.config.json`
```json
{
    "cloudfunctionRoot": "path/to/cloud/functions",
}
``` 

## API 文档

以下是各个组件的 `API` 使用文档

### ocr 组件
### 属性

|属性名|含义|必填|默认值|
|--|--|--|--|
|uploadText|上传按钮的文字|否|上传图片|
|recognizeText|识别按钮的文字|否|进行识别|
|mode|识别模式|是|<center>-</center>|
|imgUrl|默认图片 url|否|略|
|type|对象类型(仅在`drivingLicence`模式中有效)|否|0|

#### mode 有效值

|值|含义|对应云函数名|
|--|--|--|
|handWriting|手写体识别|handWriting|
|idCard|身份证识别|idCard|
|bizLicense|营业执照识别|bizLicense|
|drivingLicence|行驶证驾驶证识别|drivingLicence|
|plate|车牌号识别|plate|
|general|通用印刷体识别|general|
|bankCard|银行卡识别|bankCard|
|bizCard|名片识别（V2)|bizCard|

### 事件

|事件名|触发条件|
|--|--|
|finish|识别完成|

#### finish 事件对象属性

|属性|类型|说明|
|--|--|--|
|timeStamp|Number|事件触发事件|
|type|String|事件类型|
|detail|Object|识别结果，参考[腾讯云文字识别 API 文档](https://cloud.tencent.com/document/product/866/17594)|

### img-detect 组件
### 属性

|属性名|含义|必填|默认值|
|--|--|--|--|
|uploadText|上传按钮的文字|否|上传图片|
|recognizeText|识别按钮的文字|否|进行识别|
|mode|识别模式|是|<center>-</center>|
|imgUrl|默认图片 url|否|略|

#### mode 有效值
|值|含义|对应云函数名|
|--|--|--|
|pornDetect|图片鉴黄|pornDetect|
|tagDetect|图片标签识别|tagDetect|

### 事件

|事件名|触发条件|
|--|--|
|finish|识别完成|

#### finish 事件对象属性

|属性|类型|说明|
|--|--|--|
|timeStamp|Number|事件触发事件|
|type|String|事件类型|
|detail|Object|识别结果，参考[腾讯云图片标签 API 文档](https://cloud.tencent.com/document/product/865/17592)以及[腾讯云智能鉴黄 API 文档](https://cloud.tencent.com/document/product/864/17609)|

### face-fuse 组件
### 属性

|属性名|含义|必填|默认值|
|--|--|--|--|
|uploadText|上传按钮的文字|否|上传图片|
|recognizeText|融合按钮的文字|否|进行融合|
|customImgUrl|默认图片 url|否|略|
|templateImgUrl|模板图片 url|否|略|
|hideTemplate|是否隐藏模板图片|否|false|

注：templateImgUrl 指定的图片仅供展示，融合中使用的模板图片由云函数的参数指定。

### 事件

|事件名|触发条件|
|--|--|
|finish|识别完成|

#### finish 事件对象属性

|属性|类型|说明|
|--|--|--|
|timeStamp|Number|事件触发事件|
|type|String|事件类型|
|detail|String|融合结果图片 url|

### 对应云函数
* faceFuse
