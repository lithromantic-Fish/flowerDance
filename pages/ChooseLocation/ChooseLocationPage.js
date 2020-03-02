// pages/ChooseLocation/ChooseLocationPage.js
//地址最多10条，不做分页
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addrId: "",
    isDefault: "",

    showEmpty:0 ,  //如果当前页没有数据，就显示省缺图
    allNumber:''   //记录当前页的总共的地址条数，当大于或等于10条的时候不能继续增加
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    that.requestAddr();
  },


  delAddr: function(e) {
    var that = this;
    var nowidx = parseInt(e.currentTarget.dataset.idx.split(":")[0]); //当前索引,值为address_id
    var is_default=e.currentTarget.dataset.idx.split(":")[1];

    if(is_default=="true"){
      wx.showToast({
        title: '不能将默认地址删除',
        icon:'none'
      })
      return;
    }

    wx.showModal({
      content: '确认删除地址',
      cancelText: '取消',
      confirmText: '确认',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=deleteaddress&uid=' + app.globalData.uId,
            method: "POST",
            data: {
              id: nowidx
            },
            header: {
              "content-type": "application/x-www-form-urlencoded"
            },
            success: function(res) {
              that.onLoad();
            },
            fail: function() {
              that.setData({
                curMessage: "删除地址失败",
                curDisplay: "block"
              })
            }
          })
        } else if (res.cancel) {

        }
      }
    })

  },

  setDefault: function(e) { //设置默认地址
    var that = this;
    var id = parseInt(e.target.dataset.imgsrc.split(":")[1]);
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=setdefaultaddress&uid=' + app.globalData.uId,
      method: "POST",
      data: {
        id: id
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        that.onLoad();
      },
      fail: function() {
        wx.showToast({
          title: '设置默认地址失败',
          icon:'none'
        })
      }
    })
  },

  addAddr: function(e) {
    var that = this;
    if(that.data.allNumber==10||that.data.allNumber>10){
      wx.showToast({
        title: '最多添加10条地址数据',
        icon:'none'
      })
    }else {
      app.globalData.globalAddrId = "";
      wx.navigateTo({
        url: "../FullLocation/FullLocationPage"
      })
    }
  },

  editAddr: function(e) {
    var that = this;
    var nowidx = parseInt(e.currentTarget.dataset.idx); //当前索引
    app.globalData.globalAddrId = parseInt(nowidx);

    wx.navigateTo({
      url: "../FullLocation/FullLocationPage"
    })
  },


  fromOrder: function(e) { //如果是从订单点击进来才有此函数
    var that = this;
    if (app.globalData.addrFrom == 1) { //1表示从订单那里过来
      //过来后马上将这个值置为0,这样消除点击事件
      app.globalData.addrFrom == 0;
      var addr = e.currentTarget.dataset.lockerid;
      app.globalData.province = addr.split(":")[0];
      app.globalData.city = addr.split(":")[1];
      app.globalData.area = addr.split(":")[2];
      app.globalData.addrDetail = addr.split(":")[3];
      app.globalData.addrId = addr.split(":")[4];
      app.globalData.name = addr.split(":")[5];
      app.globalData.phone = addr.split(":")[6];

      app.globalData.orderFrom = 1; //1表示从地址页进入未生成订单的订单页
      wx.navigateBack({
        delta: 1
      })
    }
  },

  requestAddr: function() {
    var that = this;
    wx.showLoading({
      title: '数据请求中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=myaddresslist&uid=' + app.globalData.uId,
      method: "GET",
      success: function(res) {
        wx.hideLoading();
        var len=res.data.data.length;
        that.data.allNumber=len;    //记录当前页总共的地址条数
        if (len == 0) {     //没数据则显示缺省图
          that.setData({
            showEmpty:1
          })
        } else { //有更多数据的情况
          that.setData({
            showEmpty:0,
            addrList: res.data.data
          })
        }
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: '数据请求失败',
          icon: 'none'
        })
      }
    })
  },

  onShow: function() {
    var that = this;
    if (app.globalData.addrListFrom == 1) {
      app.globalData.addrListFrom = 0;
      that.onLoad();
    }
  }
})