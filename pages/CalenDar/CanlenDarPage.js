// pages/CalenDar/CanlenDarPage.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dayStyle: [
      { month: 'current', day: 15, color: 'white', background: '#AAAAAA' },
      { month: 'current', day: 16, color: 'white', background: '#F19FAD' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    that.getMessage();
  },

  getMessage: function () {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=user&a=flowerrecode&uid=' + app.globalData.uId,
      method: "GET",
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    })
  }

})