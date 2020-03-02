// pages/EssayDetail/EssayDetailPage.js

var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLike:"",
    likeNumber: "",
    showShare:1   // 下面图片的分享默认为1
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.showShareMenu({        //将小程序的转发按钮显示出来
      withShareTicket: true
    })

    //进入该页面则将pageListFromDetail置为1，表示从详情页回到列表页
    app.globalData.pageListFromDetail=1;

    wx.request({
      url:app.globalData.url + '/mobile/index.php?m=flowerapi&c=article&a=articledetail&article_id=' + app.globalData.goodsOrPageId + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        console.log("返回给我的文章数据为:");
        console.log(res.data.data.content);
        that.data.likeNumber = res.data.data.like_number; //将likeNumber放入全局

        var article = res.data.data.content; // 放入文章内容
        WxParse.wxParse('article', 'html', article, that, 5);

        var img_src = ""; //文章如果无图片，则放置一张默认的图片
        img_src = res.data.data.img_url;
        if (img_src == null) img_src = "../images/arr_today.jpg";

        that.data.is_like = res.data.data.is_like;

        var heart = "../Images/heart_white.png"; //下面是否喜欢放置的心形图片
        if (res.data.data.is_like == 1) heart = "../Images/heart_red.png";

        wx.setNavigationBarTitle({ //设置标题
          title: res.data.data.title
        })
        that.setData({ //设置相关数据
          imgSrc: img_src,
          like_number: res.data.data.like_number,
          heart: heart
        })
      },
      fail: function() {
      }
    })
  },

  // onShareAppMessage: function(res) {
  //   let that = this;
  //   return {
  //     title: '文章分享', // 转发后 所显示的title
  //     path: '/pages/EssayDetail/EssayDetailPage?article_id=42', // 相对的路径
  //     success: (res) => { // 成功后要做的事情
  //       console.log("进入成功得页面");
  //       wx.getShareInfo({
  //         shareTicket: res.shareTickets[0],
  //         success: (res) => {
  //           wx.showToast({
  //             title: '转发成功',
  //           })
  //           that.setData({

  //           })
  //         },
  //         fail: function(res) {
  //           wx.showToast({
  //             title: '转发取消',
  //           })
  //         },
  //         complete: function(res) {
  //           wx.showToast({
  //             title: '转发取消',
  //           })
  //         }
  //       })
  //     },
  //     fail: function(res) {
  //       // 分享失败
  //       console.log(res)
  //     }
  //   }
  // },

  likeArticle: function() {
    var that = this;

    wx.request({
      url:app.globalData.url + '/mobile/index.php?m=flowerapi&c=article&a=articlelike&uid=' + app.globalData.uId,
      method: "POST",
      data: {
        article_id: app.globalData.goodsOrPageId
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        var heart, number;
        if (res.data.data.msg == "点赞成功") {
          that.data.likeNumber = parseInt(that.data.likeNumber) + 1;
          heart = "../Images/heart_red.png";
        } else if (res.data.data.msg == "取消点赞成功") {
          that.data.likeNumber = parseInt(that.data.likeNumber) - 1;
          heart = "../Images/heart_white.png";
        }
        that.setData({
          heart: heart,
          like_number: that.data.likeNumber
        })
      },
      fail: function() {

      }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    console.log("触发了分享的函数");
  },

  hideShare:function(){
    var that=this;
    that.setData({
      showShare:0,
    })
  },

  clickToShare:function(){
    console.log("触发了点击事件");
  },


  onShareAppMessage: function (res) {     //转发的检测
    return {
      title: '美文分享,你我共读',
      // path: '/pages/Main/MainPage'
      path: '/pages/Main/MainPage?kind=1&id='+app.globalData.goodsOrPageId
    }
  }
})