// pages/GroupBuy/GroupBuyPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      that.requestGroup();
  },
  
  requestGroup:function(){
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=groupgoodsdetail&act_id='+app.globalData.goods_id+"&uid="+app.globalData.uId,
      method: "GET",
      success: function (res) {

      },
      fail: function (res) {
      }
    })
  }
})