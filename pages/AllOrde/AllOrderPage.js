// pages/AllOrde/AllOrderPage.js

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsPage: "1", //记录第几页 
    nowChoose: 0, //上面滑动条默认选中全部
    menu: [{
        text: "全部"
      }, {
        text: "待付款"
      }, {
        text: "待发货"
      },
      {
        text: "待收货"
      }, {
        text: "待评价"
      }
    ],
    showEmpty: 0, //是否显示省缺图  1则为显示
    showGo: 0 //是否显示下面的粉色按钮，为1则显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //刚开始请求list页面数据
    that.getListData();
  },

  onReachBottom: function() { //当触碰到底部的时候加载的函数
    var that = this;
    that.getListData();
  },

  getListData: function() {
    var that = this;
    wx.showLoading({
      title: '数据加载中',
    })
    if (app.globalData.myGoodsType==''){    //初始进入对上面的标签进行修改
      that.data.nowChoose=0;
    }else {
      that.data.nowChoose=parseInt(app.globalData.myGoodsType);
    }
    that.setData({
      nowChoose:that.data.nowChoose
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=order&a=orderlist&type=' + app.globalData.myGoodsType + "&page=" + that.data.goodsPage + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        wx.hideLoading();
        var str, message;
        var goods = new Array();
        var len = res.data.data.length;
        
        if(len==0&&that.data.goodsPage!=1){   //不是第一页，并且后面没数据了
          wx.showToast({
            title: '没有更多的数据了',
            icon: 'none'
          })
        }
        else if (len == 0 && that.data.goodsPage==1) {
          if (that.data.nowChoose == 0) {
            that.setData({
              showEmpty: 1,
              showGo: 1
            })
          } else {
            that.setData({
              showEmpty: 1,
              showGo: 0
            })
          }
        } else { //不是省缺图，则将数据放入
          that.setData({ //有数据则不显示省缺图
            showEmpty: 0,
            showGo: 0
          })
          if (that.data.goodsPage == 1) { //有数据且当前页为第一页,直接将数据放入,否则拼接
            for (var i = 0; i < len; i++) {
              //对订单的状态进行处理
              //且对下面显示的提示信息进行处理
              switch (res.data.data[i].type) {
                case 1:
                  str = "待付款";
                  message = "请在24小时内付款";
                  break;
                case 2:
                  message = "已付款，尽快为您发货";
                  str = "待发货";
                  break;
                case 3:
                  str = "待收货";
                  message = "请您尽快收货";
                  break;
                case 4:
                  str = "待评价";
                  message = "该订单待评价哟";
                  break;
                case 5:
                  str = "已完成";
                  message = "该订单已完成";
                  break;
                case 6:
                  str = "已取消";
                  message = "该订单已取消";
                  break;
              }
              res.data.data[i].orderstatus = str;
              res.data.data[i].message = message;
            }
            that.setData({
              goods: res.data.data
            })
          } else { //否则将数据进行拼接
            for (var i = 0; i < len; i++) {
              //对订单的状态进行处理
              //且对下面显示的提示信息进行处理
              switch (res.data.data[i].type) {
                case 1:
                  str = "待付款";
                  message = "请在24小时内付款";
                  break;
                case 2:
                  message = "已付款，尽快为您发货";
                  str = "待发货";
                  break;
                case 3:
                  str = "待收货";
                  message = "请您尽快收货";
                  break;
                case 4:
                  str = "待评价";
                  message = "该订单待评价哟";
                  break;
                case 5:
                  str = "已完成";
                  message = "该订单已完成";
                  break;
                case 6:
                  str = "已取消";
                  message = "该订单已取消";
                  break;
              }
              res.data.data[i].orderstatus = str;
              res.data.data[i].message = message;
            }
            var goods_list=that.data.goods.concat(res.data.data);
            that.setData({
              goods: goods_list
            })
          }
          that.data.goodsPage++;
        }
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      }
    })
  },

  toNext: function(e) {
    var that = this;
    var value = e.currentTarget.dataset.lockerid;
    switch (value) {
      case "全部":
        app.globalData.myGoodsType = "";
        that.setData({
          nowChoose: 0
        })
        break;
      case "待付款":
        app.globalData.myGoodsType = 1;
        that.setData({
          nowChoose: 1
        })
        break;
      case "待发货":
        app.globalData.myGoodsType = 2;
        that.setData({
          nowChoose: 2
        })
        break;
      case "待收货":
        app.globalData.myGoodsType = 3;
        that.setData({
          nowChoose: 3
        })
        break;
      case "待评价":
        app.globalData.myGoodsType = 4;
        that.setData({
          nowChoose: 4
        })
        break;
    }
    that.data.goodsPage = 1;    //2者均做一个初始化
    that.setData({
      goods:""
    })
    that.onLoad();
  },


  toOrderDetail: function(e) {
    app.globalData.order_id = e.currentTarget.dataset.lockerid;
    wx.navigateTo({
      url: '../OrderDetail/OrderDetail',
    })
  },

  showGo: function() {
    var that = this;
    wx.reLaunch({
      url: '../Main/MainPage',
    })
  }
})