// pages/Find/FindPage.js

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    contextPage: 1, //页数，初始进入请求的第一页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.showShareMenu({        //将小程序的转发按钮显示出来
      withShareTicket: true
    })
    that.requestPages();

  },

  onReachBottom: function() { //当触碰到底部的时候加载的函数
    var that = this;
    that.requestPages();
  },
  onPullDownRefresh: function() { //下拉的时候执行的函数
    var that = this;
    wx.showLoading({
      title: '数据加载中'
    })
    wx.startPullDownRefresh({
      success: function() {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        that.onLoad();
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: '数据加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },

  changeToPage: function(e) {
    var that = this;
    wx.getStorage({
      key: 'uId',
      success: function (res) {
        var _uId = res.data;
        if (_uId) {
          var message = e.target.dataset.imgsrc;
          app.globalData.goodsOrPageId = message;
          wx.navigateTo({
            url: "../EssayDetail/EssayDetailPage"
          })
        } else {
          wx.showModal({
            title: '登录授权',
            content: '即将跳转到登录页进行登录',
            confirmText: '登录',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../Login/LoginPage',
                })
              } else if (res.cancel) {

              }
            }
          })

        }
      }, fail: function () {
        wx.showModal({
          title: '登录授权',
          content: '即将跳转到登录页进行登录',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../Login/LoginPage',
              })
            } else if (res.cancel) {

            }
          }
        })
      }

    })

  },

  requestPages: function() { //加载文章数据
    var that=this;
    wx.showLoading({
      title: '数据加载中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=article&a=articlelist&uid=' + app.globalData.uId + "&page=" + that.data.contextPage,
      method: "GET",
      success: function(res) {
        wx.hideLoading();
        var len = res.data.data.length;
        if (len == 0) { //没有更多的数据了
          wx.showToast({
            title: '没有更多的数据了',
            icon: "none"
          })
        } else { //还有更多的数据
          var time_show;
          for (var i = 0; i < len; i++) {
            //对时间进行处理，今天显示今天，其他显示时间
            var date = new Date();
            var Y = parseInt(date.getFullYear());
            var M = parseInt(date.getMonth() + 1);
            var D = parseInt(date.getDate());
            var get_date = res.data.data[i].add_time;
            var get_y = parseInt(get_date.split("-")[0]);
            var get_m = parseInt(get_date.split("-")[1]);
            var get_d = parseInt(get_date.split("-")[2]);
            if (Y == get_y && M == get_m && D == get_d) time_show = "今天";
            else time_show = res.data.data[i].add_time;

            res.data.data[i].add_time = time_show;
          }
          if(that.data.contextPage==1){   //加载的是第一页的数据,直接将数据放入
            that.setData({
              pageList: res.data.data
            })
          }else {   //否则为下拉，将数据拼接上去
            var page_list=that.data.pageList.concat(res.data.data);
            that.setData({
              pageList:page_list
            })
          }
          that.data.contextPage++;
        }
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      }
    })
  },

  onShow:function(){    //当页面显示的时候，将page置为1
    var that=this;
    that.data.contextPage=1;
    if (app.globalData.pageListFromDetail==1){
      app.globalData.pageListFromDetail == 0;
      that.onLoad();
    }
  },

  onShareAppMessage: function (res) {     //转发的检测
    return {
      title: '菁棠花业',
      path: '/pages/Mian/MainPage'
    }
  }

})