// pages/Login/LoginPage.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    kind: "", //转发过来的类型，目前规定 1来自文章
    id:""  ,  //来自产品或者文章的id
  },

  //登录功能
  bindGetUserInfo: function(e) {
    var that = this;

    if (e.detail.userInfo) { //点击了同意登录请求
      wx.showLoading({
        title: '登录中...',
      })


      wx.login({ 
        success: function(res) {
          var code = res.code;
          if (code) {
            wx.getUserInfo({
              success: function(infoRes) {
                //获取用户敏感数据密文和偏移向量
                var url = app.globalData.url + "/mobile/index.php?m=flowerapi&c=login&a=index";
                wx.request({
                  url: url,
                  method: 'POST',
                  data: {
                    code: code, //将code发给后台拿token
                    encryptedData: infoRes.encryptedData,
                    iv: infoRes.iv
                  },
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function(res) {
                    if (res.data.code == 200) {
                      app.globalData.uId = res.data.data[0].uid;
                      wx.setStorage({
                        key: 'uId',
                        data: app.globalData.uId,
                        success: function() {
                          wx.hideLoading();
                          if(that.kind){
                            wx.redirectTo({
                              url: '../EssayDetail/EssayDetailPage',
                            })
                          }else{
                            app.globalData.fromLogin = 1;
                            //此处需要判断是否是分享还是普通用户直接登录
                            wx.navigateBack({
                              delta: 1
                            })
                          }
                        },
                      })
                    } else {
                      wx.hideLoading();
                      wx.showToast({
                        title: '登录失败',
                        icon: 'none'
                      })
                    }
                  },
                  fail: function(res) {
                    wx.hideLoading();
                    wx.showToast({
                      title: '接口请求失败',
                      icon: 'none'
                    })
                  }
                })
              },
              fail: function(res) {
                wx.hideLoading();
                wx.showToast({
                  title: '获取用户信息失败',
                  icon: 'none'
                })
              }
            })
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '登录失败',
              ico: 'none'
            })
          }
        },
        fail: function(res) {
          wx.hideLoading();
          wx.showToast({
            title: '登录请求失败',
            icon: 'none'
          })
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    that.kind=options.kind;
    that.id=options.id;

    wx.showShareMenu({ //将小程序的转发按钮显示出来
      withShareTicket: true
    })
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

  onShareAppMessage: function (res) {     //转发的检测
    return {
      title: '菁棠花业',
      path: '/pages/Main/MainPage'
    }
  }
})