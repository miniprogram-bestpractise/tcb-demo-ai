/* global getApp, Page */
Page({
    data: {},
    handleFinish(e) {
        if (!e.detail) { return }
        this.setData({
          card: e.detail.items
        });
    },
});
