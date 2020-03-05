// pages/My/MyPage.js

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    display: "none",
    ifLogin:0
  },

  onShow: function() {
    var that = this;

    // 是否从登录页回来
    if(app.globalData.fromLogin==1){
      app.globalData.fromLogin == 0;
      that.setData({
        ifLogin:1
      })
      // that.requestMy(); //加载个人信息
    }
    // console.log('iod',wx.getStorageSync('uId'))
    that.requestMy(); //加载个人信息

  },

  changeToLogin: function() {

    wx.showModal({
      title: '登录授权',
      content: '即将跳转到登录页进行登录',
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '../Login/LoginPage',
          })
        } else if (res.cancel) {

        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    wx.getStorage({
      key: 'uId',
      success: function(res) {
        var _uId = res.data;
        if (_uId) {
         that.setData({
           ifLogin:1
         })
          
          that.requestMy(); //加载个人信息
        } else {
          that.setData({
            ifLogin: 0
          })
        }
      },
      fail: function() {
        that.setData({
          ifLogin: 0
        })
      }
    })

    that.requestPhone(); //请求联系客服的电话

    wx.showShareMenu({ //将小程序的转发按钮显示出来
      withShareTicket: true
    })

  },

  changeToAddr: function() {
    app.globalData.addrFrom = 2; //2表示从我的里面进入
    wx.navigateTo({
      url: "../ChooseLocation/ChooseLocationPage"
    })
  },

  toAllOrder: function() {
    //此处需要将显示的东西提前设置
    app.globalData.myGoodsType = ''; //不填默认为是全部
    wx.navigateTo({
      url: '../AllOrde/AllOrderPage',
    })
  },

  //点击个人中心图片进入相应的页面
  toOrder: function(e) {
    app.globalData.myGoodsType = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: '../AllOrde/AllOrderPage',
    })
  },

  toMyAddr: function() {
    wx.navigateTo({
      url: '../ChooseLocation/ChooseLocationPage',
    })
  },

  toCalenDar() {
    wx.navigateTo({
      url: '../CalenDar/CanlenDarPage',
    })
  },

  toShare() {
    wx.navigateTo({
      url: '../Share/SharePage',
    })
  },

  toIntegray() {
    wx.navigateTo({
      url: '../Integray/IntegrayPage',
    })
  },

  ConnectHome: function() {
    wx.showModal({
      title: '客服电话',
      content: app.globalData.homePhone,
      cancelText: '取消',
      confirmText: '拨打',
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: app.globalData.homePhone,
          })
        } else if (res.cancel) {

        }
      }
    })
  },


  requestPhone: function() { //请求电话的接口
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=servicephone&uid=' + app.globalData.uId,
      method: "GET",
      success: function(res) {
        app.globalData.homePhone = res.data.data.service_phone;
      },
      fail: function() {
        wx.showToast({
          title: '客服电话加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  requestMy: function() { //加载个人信息，加载完后继续加载客服与帮助的信息
    var that = this;
    console.log('app.globalData.uId', app.globalData)
    console.log('app.globalData.uId', app.globalData.uId)
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=user&a=getuserinfo&uid=' +wx.getStorageSync("uId"),
      method: "GET",
      success: function(res) {
        //照片如果没有则默认一张
        var avater = "../Images/little_head2.jpeg";
        if (res.data.data.avater != null) avater = res.data.data.avater;

        app.globalData.uId = res.data.data.uid;
        app.globalData.myIntegral = res.data.data.integral;
        that.setData({
          userName: res.data.data.user_name,
          userAvater: avater
        })
        that.requestPhone(); //加载完个人信息后加载电话
      },
      fail: function() {
        wx.showToast({
          title: '数据加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  onShareAppMessage: function(res) { //转发的检测
    return {
      title: '菁棠花业',
      path: '/pages/Main/MainPage'
    }
  }
})