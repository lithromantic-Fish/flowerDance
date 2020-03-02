// pages/Evaluate/EvalutePage.js

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentStr: "",
    display:"none"  //初始进入的时候弹框隐藏
  },

  getWords(e) {
    var page = this;
    // 文本长度
    var textLen = e.detail.value.length;

    page.setData({
      textLen: textLen,
      contentStr: e.detail.value
    });
  },

  Evalute: function() {
    var that = this;
    if (that.data.contentStr) {
      wx.request({
        url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=order&a=commentorder&uid=' + app.globalData.uId,
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          // 这里的order_id需要进行一定的修改
          order_id: app.globalData.order_id,
          content: that.data.contentStr
        },
        success: function(res) {
          if (res.data.code == 200) {
            wx.navigateTo({
              url: '../SucEvaluate/SucEvaluatePage',
            })
          }
        },
        fail: function(res) {
        }
      })
    }else {           //如果没有输入则提示信息
      that.setData({
        showMessage: "请输入评论",
        display: "flex",
      }),
        setTimeout(function () {
          that.setData({
            showMessage: "",
            display: "none",
          })
        }, 1000)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})