export function uploadImage(dRes) {
  return new Promise((resolve, reject) => {
    const fileName = dRes.tempFilePaths[0];
    const dotPosition = fileName.lastIndexOf(".");
    const extension = fileName.slice(dotPosition);
    const cloudPath = `${Date.now()}-${Math.floor(
      Math.random(0, 1) * 10000
    )}${extension}`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath: dRes.tempFilePaths[0],
      success: res => {
        resolve(res);
      },
      fail: () => {
        wx.hideLoading();
        reject();
      }
    });
  });
}
