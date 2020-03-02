// pages/PaySuccess/PaySuccess.js
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

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  seeDetail:function(){
    var that=this;
    wx.navigateTo({
     url: '../OrderDetail/OrderDetail',
    })
  },

  backHome:function(){
    var that=this;
    wx.reLaunch({
      url: '../Main/MainPage',
    })
  }
})