// pages/GoodsDetail/DetailPage.js
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
let isAnim = false
let aTempHeight = null
let cData = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canBuy: 1, //详情页是否可以购买，这个是公用的
    currentTab: 0, //用来记录当前点击的是哪一个，0-商品参数  1-商品评价
    sayingPage: 1, //当前的评价页数，点击的的时候置1，下拉的时候++
    gallery_index: 1,
    choose: 0,
    animationHeight:null,
    nature:'block',
    natureCur: "none", //刚开始将属性的幕布设置为none
    display: "none",
    coverData:"100%",
    orderNextPrice: '', //用来记录传到下一个页面的订阅花的价格
    good_sku:{},//规格
    good_attr:{},//选中的商品规格
    total:1,
    remainTime: '' //剩余的时间，用来做倒计时
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //进入先设置是哪个页面的样式，普通-秒杀还是团购
    that.setData({
      goodsType: app.globalData.goodsType
    });

    //获得手机屏幕高度并赋值,这里是如果是订阅花有属性值可以选择
    var height = wx.getSystemInfoSync().windowHeight;
    height = (parseInt(height) - 70) + "px";
    that.setData({
      natureHeight: height,
      animationHeight:height
    })

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    })

    if (app.globalData.goodsType == 1 || app.globalData.goodsType == 4 || app.globalData.goodsType == 5) {
      that.requestNormal();
    } else if (app.globalData.goodsType == 3) { //3--秒杀
      that.requestGroup();
    } else if (app.globalData.goodsType == 2) { //2--团购
      that.requestSpike();
    }

    wx.showShareMenu({ //将小程序的转发按钮显示出来
      withShareTicket: true
    })
  },

  swiperchange: function(e) {
    var that = this;
    that.data.sayingPage = 1;
    var cur = e.detail.current;
    var singleNavWidth = wx.getSystemInfoSync().windowWidth / 5;
    this.setData({
      choose: cur,
      navScrollLeft: (cur - 2) * singleNavWidth
    })

    if (cur == 1) {
      that.requestSaying();
    }
  },

  requestSaying: function() { //请求评价的数据接口
    var that = this;
    wx.showLoading({
      title: '获取评价信息中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=goodscomment&goods_id=' + app.globalData.goodsOrPageId + "&page=" + that.data.sayingPage + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        wx.hideLoading();
        var len = res.data.data.length;
        if (len == 0) {
          wx.showToast({
            title: '没有更多数据了',
            icon: 'none'
          })
        } else {
          if (that.data.sayingPage == 1) { //第一页的时候，直接将数据放入
            that.setData({
              saying: res.data.data
            })
          } else {
            var list = that.data.saying.concat(res.data.data);
            that.setData({
              saying: list
            })
          }
          that.data.sayingPage++;
        }

      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '获取评价信息失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
// 关闭选择规格

  delCur: function () {
    this.popupBar()
  },

  showPopupLayer:function(){
    this.popupBar()
  },

  //分享内页
  sharePage(){
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  // 控制显示和隐藏加入购物车规格弹窗
  popupBar:function(){
    isAnim = !isAnim
    console.log('isAnim',isAnim)
    if (isAnim) {
      cData = 0
      this.setData({
        animationHeight: 0,
      })
    } else {
      cData = '100%'
      this.setData({
        animationHeight: this.data.natureHeight,
      })
    }
    this.setData({
      coverData: cData,
    })
  },
  hideBlock(){
    this.popupBar()

  },

  buyNow: function() {
    var that = this;
    //如果是没登录，需要登录一下。
    wx.getStorage({
      key: 'uId',
      success: function(res) {
        var _uId = res.data;
        if (_uId) {
          app.globalData.orderFrom = 2; //2表示从详情页进入未付款订单页

          if (app.globalData.goodsType == 4) { //从订阅花过来，弹出属性框,并请求数据
            that.requestNature();
          } else {
            wx.navigateTo({
              url: '../PayDetail/PayDetailPage',
            })
          }
        } else {
          wx.showModal({
            title: '登录授权',
            content: '即将跳转到登录页进行登录',
            success:function(res){
                if(res.confirm){
                  wx.navigateTo({
                    url: '../Login/LoginPage',
                  })
                }else if(res.cancel){
                  
                }
            }
          })
         
        }
      },
      fail: function() {
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

  changeEnd: function(e) {
    var that = this;
    that.setData({
      gallery_index: e.detail.current + 1
    })
  },

  //普通商品请求的接口,包含当日达和订阅花
  requestNormal: function() {
    var that = this;

    //对当日达或者订阅花进行一个判断
    wx.showLoading({
      title: '数据加载中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=goodsdetail&goods_id=' + app.globalData.goodsOrPageId + "&today_id=" + app.globalData.todayId + "&sub_id=" + app.globalData.subId + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        wx.hideLoading();
        //获取图片的长度并将src放入
        var imgArr = new Array();
        var imgLen = res.data.data.goods_gallery.length;

        for (var i = 0; i < imgLen; i++) {
          imgArr[i] = new Object();
          imgArr[i].img_url = app.globalData.url + "/" + res.data.data.goods_gallery[i].img_url;
        }

        var article = res.data.data.goods_desc; // 放入文章内容
        WxParse.wxParse('article', 'html', article, that, 5);

        var comment_number; //评论数量如果是''，则显示为0，
        if (!res.data.data.comment_number) {
          comment_number = 0;
        } else {
          comment_number = res.data.data.comment_number;
        }

        //对shop_price进行一个处理,分为整数和小数部分
        var price = res.data.data.shop_price.toString();
        var big_text = price.split(".")[0];
        var last_text = price.split(".")[1];
        if (res.data.data.goods_sku){
          res.data.data.goods_sku.row.forEach((ele,idx)=>{
            if(idx!=0){
              ele.isActive = false
            }else{
              ele.isActive = true
            }
          })

          that.setData({
            good_sku: res.data.data.goods_sku,
            good_attr:res.data.data.goods_sku.row[0]  //默认将第一个规格作为选中
          })
        }
        that.setData({
          gallery_length: imgLen,
          goods_gallery: imgArr,
          goods_name: res.data.data.goods_name,
          goods_brief: res.data.data.goods_brief,
          orderGoodsPrice: res.data.data.shop_price,
          bigText: big_text,
          lastText: last_text,
          give_integral: res.data.data.give_integral,
          comment_number: comment_number,
          goods_thumb: res.data.data.goods_thumb
        })
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '数据获取失败',
          icon: 'none'
        })
      }
    })
  },
  //选择商品规格
  selectAttr(e){
    console.log('e.currentTarget.attr',e.currentTarget.dataset)

    this.data.good_sku.row.forEach((ele,idx)=>{
      ele.isActive = false
      if (e.currentTarget.dataset.attr.id == ele.id){
        ele.isActive = true
      }

    })
    this.setData({
      good_sku: this.data.good_sku,
      good_attr: e.currentTarget.dataset.attr
    })
  },

  //输入框直接改变购买数量
  getSelectNum(e){

    console.log('e', e.detail)
    this.setData({
      total:e.detail
    })
  },

  // 确认加入购物车
  confirm: function () {
    var that = this
    if (this.data.total == 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '数量不能为0',
      })
      return
    }
    console.log('attr', this.data.good_attr)
    console.log('total', this.data.total)
    //如果有商品规格选择
    if (this.data.good_attr) {
      var parms = {
        "title": this.data.good_attr.title,
        "goods_id": app.globalData.goodsOrPageId ,
        "skus_id": parseInt(this.data.good_attr.id) ? parseInt(this.data.good_attr.id):0,
        "num": this.data.total,
        "uid": app.globalData.uId||wx.getStorageSync('uId')
      }
    }else{
      var parms = {
        "title": this.data.goods_name,
        "goods_id": app.globalData.goodsOrPageId,
        "skus_id": 0,
        "num": this.data.total,
        "uid": app.globalData.uId || wx.getStorageSync('uId')
      }
    }

      wx.request({
        url: app.globalData.url+'/mobile/index.php?m=flowerapi&c=order&a=cart',
        data:parms,
        success:function(res){
          console.log('res',res.data)
          if(res.data.code==200){
            that.popupBar()

            wx.showToast({
              icon:'none',
              title: '添加成功,该商品在购物车等亲~',
            })
          }else{
            wx.showToast({
              icon: 'none',
              title: res.data.msg,
            })
          }
        }
      })
  },
  // addNums(){
  //   this.data.total++
  //   this.setData({
  //     total:this.data.total
  //   })
  // },
  // subNums(){
  //   this.data.total--
  //   this.setData({
  //     total: this.data.total
  //   })
  // },
  // 团购商品请求的接口
  requestGroup: function() {
    var that = this;
    wx.showLoading({
      title: '数据获取中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=groupgoodsdetail&act_id=' + app.globalData.actId + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        wx.hideLoading();

        console.log("详情页返回给我的数据为");
        console.log(res);
        app.globalData.goodsOrPageId = res.data.data.goods_id;
        //对时间进行一个处理,算出剩余的秒数并保存,保存在全局的remainTime里面
        that.getSec(res.data.data.acti_time);
        //接下来根据秒数，将时分秒保存到页面去
        that.putTimeToPage();

        var imgArr = new Array();
        var imgLen = res.data.data.goods_gallery.length;
        for (var i = 0; i < imgLen; i++) {
          imgArr[i] = new Object();
          imgArr[i].img_url = app.globalData.url + '/' + res.data.data.goods_gallery[i].img_url;
        }

        var comment_number;
        if (!res.data.data.comment_number) {
          comment_number = 0;
        } else {
          comment_number = res.data.data.comment_number;
        }

        var article = res.data.data.goods_desc; // 放入文章内容
        WxParse.wxParse('article', 'html', article, that, 5);

        //对商品价格进行一个处理
        var price = res.data.data.sec_price.toString();
        var group_big_text = price.split(".")[0];
        var group_last_text = price.split(".")[1];

        that.setData({
          gallery_length: imgLen,
          goods_gallery: imgArr,
          goods_name: res.data.data.goods_name,
          goods_brief: res.data.data.goods_brief,
          shop_price: res.data.data.shop_price,
          give_integral: res.data.data.give_integral,

          groupBigText: group_big_text,
          groupLastText: group_last_text,

          comment_number: comment_number
        })

        //在最后设置一个倒计时，对页面时间做一个倒计时
        setTimeout(function() {
          that.countDown();
        }, 1000) //延迟时间 这里是1秒

      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '数据获取失败',
          icon: 'none'
        })
      }
    })
  },

  //秒杀的接口
  requestSpike: function() {
    var that = this;
    wx.showLoading({
      title: '数据加载中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=skillgoodsdetail&sec_id=' + app.globalData.actId + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        wx.hideLoading();

        console.log("秒杀详情页的数据为");
        console.log(res);
        app.globalData.goodsOrPageId = res.data.data.goods_id;
        //对时间进行一个处理,算出剩余的秒数并保存,保存在全局的remainTime里面
        that.getSec(res.data.data.acti_time);
        //接下来根据秒数，将时分秒保存到页面去
        that.putTimeToPage();

        app.globalData.goodsOrPageId = res.data.data.goods_id;


        var imgArr = new Array();
        var imgLen = res.data.data.goods_gallery.length;
        for (var i = 0; i < imgLen; i++) {
          imgArr[i] = new Object();
          imgArr[i].img_url = app.globalData.url + '/' + res.data.data.goods_gallery[i].img_url;
        }

        var article = res.data.data.goods_desc; // 放入文章内容
        WxParse.wxParse('article', 'html', article, that, 5);

        var comment_number;
        if (!res.data.data.comment_number) {
          comment_number = 0;
        } else {
          comment_number = res.data.data.comment_number;
        }

        //对商品的价格进行一个处理
        //对商品价格进行一个处理
        var price = res.data.data.sec_price.toString();
        var spike_big_text = price.split(".")[0];
        var spike_last_text = price.split(".")[1];

        that.setData({
            gallery_length: imgLen, //轮播图
            goods_gallery: imgArr,
            goods_name: res.data.data.goods_name,
            goods_brief: res.data.data.goods_brief,
            spikeBigText: spike_big_text,
            spikeLastText: spike_last_text,
            give_integral: res.data.data.give_integral, //商品送的积分
            shop_price: res.data.data.shop_price, //商品原价
            rob_number: res.data.data.rob_number, //商品已抢数量
            comment_number: comment_number, //商品评价数量
            haveGoods: res.data.data.is_rob //是否已经抢完
          }),

          //在最后设置一个倒计时，对页面时间做一个倒计时
          setTimeout(function() {
            that.countDown();
          }, 1000) //延迟时间 这里是1秒
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '数据获取失败',
          icon: 'none'
        })
      }
    })
  },

  BackHome: function() {
    wx.reLaunch({
      url: '../Main/MainPage',
    })
  },

  connectHome: function() {
    wx.showModal({
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

  toLeft: function() { //跳转到商品参数
    var that = this;
    that.data.currentTab = 0;
    that.setData({
      choose: 0,
      currentTab: 0
    })
  },

  toRight: function() { //跳转到商品参数
    var that = this;
    that.data.currentTab = 1;
    that.data.sayingPage = 1; //点击过来的时候都将页数置为1
    that.setData({
      choose: 1,
      currentTab: 1
    })
  },


  chooseHow: function(e) {
    var that = this;
    app.globalData.howId = e.currentTarget.dataset.lockerid.split(":")[1];
    var price = e.currentTarget.dataset.lockerid.split(":")[2];
    var index = e.currentTarget.dataset.lockerid.split(":")[0];
    that.data.orderNextPrice = price;
    that.setData({
      orderGoodsPrice: price,
      howGet: index
    })
  },

  chooseWhen: function(e) {
    var that = this;
    app.globalData.whenId = e.currentTarget.dataset.lockerid.split(":")[1];
    var index = e.currentTarget.dataset.lockerid.split(":")[0];
    that.setData({
      whenGet: index
    })
  },



  requestNature: function() { //获取订阅花的2种属性
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=subscribedeliverylist&uid=' + app.globalData.uId,
      method: "GET",
      success: function(res) {
        that.setData({
          whenList: res.data.data
        })
      },
      fail: function(res) {}
    });

    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=subscribescalelist&goods_id=' + app.globalData.goodsOrPageId + '&uid=' + app.globalData.uId,
      method: "GET",
      success: function(res) {
        that.setData({
          howList: res.data.data,
          natureCur: "block"
        })
      },
      fail: function(res) {}
    });
  },

  onReachBottom: function() { //当触碰到底部的时候加载的函数
    var that = this;
    if (that.data.currentTab == 1) {
      that.requestSaying();
    }
  },

  onShow: function() { //页面加载的时候把订阅花选的属性都清空,同时清空样式
    var that = this;
    app.globalData.howId = '';
    app.globalData.whenId = '';
    that.setData({
      howGet: '-1',
      whenGet: '-1'
    })
  },

  getSec: function(time) { //类似于2019-04-05 12:12:10，算出剩余秒数并保存
    var that = this;
    console.log("即将进行转化的时间为:");
    console.log(time);
    var future_time = that.DateToUnix(time); //得到截止的时间
    var now_time = new Date().getTime(); //得到现在的时间
    now_time = now_time / 1000;
    that.data.remainTime = parseInt(future_time - now_time); //计算的时间多了一个小时，这里把他减掉
    console.log("计算出来剩下的秒数为:");
    console.log(that.data.remainTime);
  },

  //将时间转换为时间戳,返回的单位是秒
  DateToUnix: function(str) {
    var f = str.split(' ', 2);
    var d = (f[0] ? f[0] : '').split('-', 3);
    var t = (f[1] ? f[1] : '').split(':', 3);
    return (new Date(
      parseInt(d[0], 10) || null,
      (parseInt(d[1], 10) || 1) - 1,
      parseInt(d[2], 10) || null,
      parseInt(t[0], 10) || null,
      parseInt(t[1], 10) || null,
      parseInt(t[2], 10) || null
    )).getTime() / 1000;
  },

  //对时间进行一个处理,将秒数转换为天，时，分，秒,如果是0 0 0则都显示0 0 0 
  putTimeToPage: function() {
    var that = this;
    var time = that.data.remainTime;
    var d = parseInt(time / 86400);
    time = time % 86400;
    var h = parseInt(time / 3600);
    h = h + d * 24; //去掉天，直接放小时
    time = time % 3600;
    var m = parseInt(time / 60);
    var s = parseInt(time % 60);
    if (h < 0) h = 0;
    if (m < 0) m = 0;
    if (s < 0) s = 0;
    if (d < 10) d = "0" + d;
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    if (h == '00' && m == '00' && s == '00') { //当到0的情况，将页面设置为已抢完的状态
      that.setData({
        canBuy: 0
      })
    }
    that.setData({
      hour: h,
      min: m,
      second: s
    })
  },

  //倒计时的一个示例
  countDown: function() {
    var that = this;

    that.data.remainTime--;
    var time = that.data.remainTime; //获取剩余时间的秒数
    if (time > 0) {
      var day = parseInt(time / (60 * 60 * 24));
      var hou = parseInt(time % (60 * 60 * 24) / 3600);
      var min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
      var sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
      hou = day * 24 + hou; //将天转换为小时
      hou = that.timeFormat(hou);
      min = that.timeFormat(min);
      sec = that.timeFormat(sec);
    } else { //当时间到0的时候，重新回到首页，首页那边对于过期的数据不会显示
      hou = "00";
      min = "00";
      sec = "00";
      that.setData({ //设置为无法购买的状态
        canBuy: 0
      })
    }
    that.setData({
      h: hou,
      m: min,
      second: sec
    })
    setTimeout(that.countDown, 1000);
  },

  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },

  onShareAppMessage: function(res) { //转发的检测
    return {
      title: '菁棠花业',
      path: '/pages/Main/MainPage'
    }
  }

})