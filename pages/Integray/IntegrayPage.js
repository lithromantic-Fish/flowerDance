// pages/Integray/IntegrayPage.js
var WxParse = require('../../wxParse/wxParse.js');
var app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    integrayPage:1,   //默认积分为第一页
    currentTab: 0,
    integray:0,          //积分选择默认选择左边那个
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that=this;

    //如果为undefined，则显示为0
    that.setIntegral();

    //获取积分规则
    that.getIntegral();

    //获取积分记录
    that.getScore();

    

    //获取屏幕的高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    })

    wx.showShareMenu({ //将小程序的转发按钮显示出来
      withShareTicket: true
    })
  },

  toRule: function () {      //点击规则的时候移动到规则来
    var that = this;
    that.setData({
      integray: 0,
      currentTab: 0
    })
  },

  toRecord: function () {      //点击规则的时候移动到规则来
    var that = this;
    that.data.integrayPage=1;
    that.setData({
      integray: 1,
      currentTab: 1
    })
  },

  setIntegral:function(){     //设置个人积分值
    var that=this;
    that.requestMy();
  },

  getIntegral:function(){   //获取积分规则
    var that = this;
    wx.showLoading({
      title: '数据获取中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=user&a=IntegralRule&uid=' + app.globalData.uId,
      method: "GET",
      success: function (res) {
        wx.hideLoading();
        var article = res.data.data.remarks; // 放入文章内容
        WxParse.wxParse('article', 'html', article, that, 5);
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: '获取数据失败',
          icon:'none'
        })
      }
    })
  },

  getScore:function(){      //获取积分记录
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=user&a=userintegral&uid=' + app.globalData.uId+"&page="+that.data.integrayPage,
      method: "GET",
      success: function (res) {
        var len=res.data.data.length;
        if(len==0){   //当长度为0的时候，提示无数据
          wx.showToast({
            title: '没有更多数据了',
            icon:'none'
          })
        }else{    //请求到了更多的数据
          if(that.data.integrayPage==1){    // 第一页的数据直接放入
            that.setData({
              record: res.data.data
            })
          }else {     //其他页的数据拼接后放入
            var list=that.data.record.concat(res.data.data);
            that.setData({
              record:list
            })
          }
          that.data.integrayPage++;
        }
      },
      fail: function (res) {
      }
    })
  },

  onReachBottom: function () { //当触碰到底部的时候加载的函数
    var that = this;
    that.getScore();
  },

  requestMy: function () { //加载个人信息，加载完后继续加载客服与帮助的信息
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=user&a=getuserinfo&uid=' + app.globalData.uId,
      method: "GET",
      success: function (res) {
        app.globalData.myIntegral = res.data.data.integral;
        var integral = app.globalData.myIntegral;
        if (!integral) integral = 0;
        that.setData({
          nowGet: integral
        })
      },
      fail: function () {
      }
    })
  },

  swiperchange: function (e) {
    var that = this;
    var cur = e.detail.current;
    if (cur == 1) {
      that.data.integrayPage = 1;
    }
    var singleNavWidth = wx.getSystemInfoSync().windowWidth / 5;
    this.setData({
      currentTab: cur,
      integray: cur
    })
  },

  onShareAppMessage: function (res) {     //转发的检测
    return {
      title: '菁棠花业',
      path: '/pages/Main/MainPage'
    }
  }

})