// pages/PayDetail/PayDetailPage.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSwitch:true,  //是否同意协议
    switch1Checked:true,
    payByNumber: true, //默认显示可以选择积分支付 
    oneButton: [{ text: '确定' }],
    myNumber: "", //当前我的积分
    goodsIntegral: "", //当前商品的所需积分
    sec_id: "", //订单里面的数据放在全局
    goods_id: "",
    shop_price: "",
    last_price: "",
    address_id: "",
    remark: "",
    dialogShow: false,
    showOneButtonDialog: false,
    payWay: "全额支付", //记录一下支付方式，初始默认全额支付
    display_way: "none", //初始默认不显示支付方式，点击显示
    pay_type: "1", //支付方式默认是1--全额支付
    display: "none",

    addr: "请选择地址",

    orderNextPrice: '', //用来记录上一个页面（从订阅花过来的）价值

    haveAddr: 0 //是否有地址，默认没有地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.data.orderNextPrice = options.price;
    that.setPayWay(); //根据商品信息（团购，秒杀，普通来决定支付方式),并将信息填入，多少钱，多少积分

    if (app.globalData.orderFrom == 2) { //1表示从详情页进来，拿默认地址
      that.getAddr(); //获得默认地址
    } else if (app.globalData.orderFrom == 1) { //1则从地址过来
      //从地址过来后，将其修改为从详情页过来
      app.globalData.orderFrom == 2;
      that.getAddrFromA();
    }
    if (parseInt(app.globalData.goodsType) == 1 || parseInt(app.globalData.goodsType) == 4 || parseInt(app.globalData.goodsType) == 5) {
      that.getGoodsDetail(); //获得普通商品信息
    } else if (parseInt(app.globalData.goodsType) == 3) {
      that.getGroupDetail(); //获得团购商品信息
    } else if (parseInt(app.globalData.goodsType) == 2) {
      that.getSpikeDetail(); //获得秒杀商品信息
    }

    //只有当goodsType==1的时候才会有积分支付,只有普通商品才有积分支付
    if (app.globalData.goodsType == 1) {
      that.getMyInfo(); //获得个人积分并判断是否可以点击积分支付
    }

    var height = wx.getSystemInfoSync().windowHeight;
    that.setData({
      curTop: (height - 100) + "px",
      curBottom: "100px"
    })
  },
  tapOneDialogButton(e) {
    this.setData({
      showOneButtonDialog: true
    })
  },

  tapDialogButton(e) {
    this.setData({
      dialogShow: false,
      showOneButtonDialog: false
    })
  },

  //用户协议switch
  switch1Change(e){
    console.log('e', e.detail.value)
    this.setData({
      isSwitch:e.detail.value
    })
  },
  //pay即为支付的接口
  Pay: function() {
    var that = this;
    if (!this.data.isSwitch){
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '需要同意协议后才能继续购物~',
        success(res) {
          if (res.confirm) {
          } else if (res.cancel) {
          }
        }
      })
      return
    }

    if (!that.data.address_id) { //对地址做一个判断
      that.setData({
          showMessage: "请选择地址",
          display: "flex",
        }),
        setTimeout(function() {
          that.setData({
            showMessage: "",
            display: "none",
          })
        }, 1000)
      return;
    }

    //对sec_id进行处理
    //秒杀id或者团购id或者订阅花id或者当日达id
    var sec_id;
    if (app.globalData.goodsType == 2 || app.globalData.goodsType == 3) {
      sec_id = app.globalData.actId;
    } else if (app.globalData.goodsType == 4) {
      sec_id = app.globalData.subId;
    } else if (app.globalData.goodsType == 5) {
      sec_id = app.globalData.todayId;
    } else {
      sec_id = "";
    }

    wx.showLoading({
      title: '页面跳转中...',
    })
    wx.request({ //点击立即购买后进行的接口请求
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=order&a=createorder',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        sec_id: sec_id,
        order_type: app.globalData.goodsType, //判断订单的类型
        //1 商品类型：1 普通商品 2 秒杀 3 团购 4 订阅花 5 当日达
        pay_type: that.data.pay_type,
        goods_id: app.globalData.goodsOrPageId,
        address_id: that.data.address_id,
        remark: that.data.remark,
        uid: app.globalData.uId,
        delive_id: app.globalData.whenId,
        sub_id: app.globalData.howId
      },
      success: function(res) {
        wx.hideLoading();
        console.log("创建订单返回给我的数据为:");
        console.log(res);
        if (res.data.code == 200) {
          app.globalData.order_id = res.data.data.order_id;
          // that.PayMoney();
          if (that.data.pay_type == 2) { //积分支付直接跳转到支付成功页
            wx.reLaunch({
              url: '../PaySuccess/PaySuccess',
            })
          } else { //金额支付则调用微信的支付接口
            that.requestPay(res.data.data.appId, res.data.data.nonceStr, res.data.data.package, res.data.data.signType, res.data.data.timeStamp, res.data.data.paySign, res.data.data.total_fee);
          }
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '付款失败',
          icon: 'none'
        })
      }
    })
  },

  //选择支付方式的函数

  changePayWay: function() {
    var that = this;
    var number = parseInt(that.data.myNumber);
    var integral = parseInt(that.data.goodsIntegral);
    if (number < integral) {
      that.setData({
        payByNumber: false
      })
    }
    that.setData({
      display_way: "block"
    })
  },


  //选择了金钱支付,当页全局的payType设置为1
  moneyPay: function() {
    var that = this;
    that.data.pay_type = 1;
    that.data.shop_price = that.data.last_price;
    that.setData({
      display_way: "none",
      payWay: "全额支付",
      shop_price: that.data.shop_price,
      pay_type: 1
    })
  },

  //选择了积分支付
  numberPay: function() {
    var that = this;
    that.data.pay_type = 2;
    that.data.shop_price = 0;
    that.setData({
      display_way: "none",
      payWay: "积分支付",
      shop_price: that.data.shop_price,
      pay_type: 2
    })
  },


  //请求地址的接口
  getAddr: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=default',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        uid: app.globalData.uId
      },
      success: function(res) {
        console.log("请求地址返回给我的数据为");
        console.log(res);
        if (res.data.code == 200) {     //有默认地址
          //对电话号码进行一个处理
          var _phone = that.delPhone(res.data.data.mobile);

          var province = res.data.data.region_name[0].region_name;
          var country = res.data.data.region_name[1].region_name;
          var place = res.data.data.region_name[2].region_name;
          var address = res.data.data.address;
          that.data.address_id = res.data.data.address_id;
          var str = province + "省 " + country + "市 " + place + address;
          that.setData({
            myName: res.data.data.consignee,
            myPhone: _phone,
            addr: str,
            haveAddr: 1, //最后将有地址设置为1，显示有地址的样式
          });
        }else if(res.data.code==0){   //没有设置默认地址
          that.setData({
            haveAddr: 0, //没有默认地址则要求选择地址
          });
        }
      },
      fail: function(res) {}
    })
  },

  getGoodsDetail: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=goodsdetail&goods_id=' + app.globalData.goodsOrPageId + "&today_id=" + app.globalData.todayId + "&sub_id=" + app.globalData.subId + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        var goods_name = res.data.data.goods_name;
        var goods_brief = res.data.data.goods_brief;
        var goods_thumb = res.data.data.goods_thumb; //商品的封面
        var shop_price = res.data.data.shop_price;
        that.data.shop_price = res.data.data.shop_price;
        that.data.last_price = res.data.data.shop_price;
        that.data.goodsIntegral = res.data.data.integral; //将商品积分设置为全局
        if (that.data.orderNextPrice) { //如果是从订阅花过来的，则将价格重置
          shop_price = that.data.orderNextPrice;
          res.data.data.shop_price = that.data.orderNextPrice;
        }

        that.setData({
          shopLastPrice: res.data.data.shop_price, //最上面的价格始终不变
          goods_name: goods_name,
          goods_brief: goods_brief,
          goods_thumb: goods_thumb,
          shop_price: shop_price,
          origin_price: shop_price,
          origin_integray: res.data.data.integral
        })

        //如果积分为0，则仅能全额支付，不可以积分支付,前面已经设置过一次了，这个是第二次判断
        if (res.data.data.integral==0){
          that.setData({
            goodsType:2
          })
        }
      },
      fail: function(res) {}
    })
  },

  getMyInfo: function() { //获得个人信息，从而获得积分值，拿去判断
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=user&a=getuserinfo&uid=' + app.globalData.uId,
      method: "GET",
      success: function(res) {
        that.data.myNumber = res.data.data.integral;
        that.setData({
          myNumber: that.data.myNumber
        })
      },
      fail: function(res) {}
    })
  },

  remark: function(e) { //记录有其他需要的信息
    var that = this;
    that.data.remark = e.detail.value;
  },

  //调用获得团购信息的接口
  getGroupDetail: function() {
    var that = this;
    that.data.sec_id = app.globalData.actId;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=groupgoodsdetail&act_id=' + app.globalData.actId + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        var goods_name = res.data.data.goods_name;
        var goods_brief = res.data.data.goods_brief;
        var goods_thumb = res.data.data.goods_thumb; //商品的封面
        var sec_price = res.data.data.sec_price;
        that.data.shop_price = sec_price;
        that.data.last_price = sec_price;
        that.setData({
          shopLastPrice: res.data.data.sec_price, //最上面的价格始终不变
          goods_name: goods_name,
          goods_brief: goods_brief,
          goods_thumb: goods_thumb,
          shop_price: sec_price,
          origin_price: sec_price
        })
      },
      fail: function(res) {}
    })
  },

  // 调用获得秒杀信息的接口
  getSpikeDetail: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=skillgoodsdetail&sec_id=' + app.globalData.actId + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        var goods_name = res.data.data.goods_name;
        var goods_brief = res.data.data.goods_brief;
        var goods_thumb = res.data.data.goods_thumb; //商品的封面
        var sec_price = res.data.data.sec_price;
        that.data.shop_price = sec_price;
        that.data.last_price = sec_price;
        that.setData({
          shopLastPrice: res.data.data.sec_price, //最上面的价格始终不变
          goods_name: goods_name,
          goods_brief: goods_brief,
          goods_thumb: goods_thumb,
          shop_price: sec_price,
          origin_price: sec_price
        })
      },
      fail: function(res) {}
    })
  },

  setPayWay: function() { //设置支付方式
    var that = this;
    if (app.globalData.goodsType == 1)
      that.setData({
        goodsType: 1
      })
  },

  //订单页选择地址
  orderChooseAddr: function() {
    app.globalData.addrFrom = 1; //1表示从订单进入
    wx.navigateTo({
      url: '../ChooseLocation/ChooseLocationPage',
    })
  },

  getAddrFromA: function() {
    var that = this;
    var province = app.globalData.province;
    var city = app.globalData.city;
    var area = app.globalData.area;
    var addrDetail = app.globalData.addrDetail;
    that.data.address_id = app.globalData.addrId;
    var name=app.globalData.name;
    var _phone=that.delPhone(app.globalData.phone);

    var str = province + "省 " + city + "市 " + area + addrDetail;
    that.setData({
      myName:name,
      myPhone:_phone,
      addr: str,
      haveAddr:1
    });
  },

  onShow: function() {
    var that = this;
    if (app.globalData.orderFrom == 1) { //表示从地址页过来，需要加载一次地址的数据
      app.globalData.orderFrom = 2;
      that.getAddrFromA();
    }
  },

  requestPay: function(_appid, _nonceStr, _package, _signType, _timeStamp, _paySign, _totalFee) { //金额额支付的调用
    var that = this;
    console.log("即将的传参为:");
    console.log(_nonceStr + '--' + _package + '--' + _signType + '--' + _timeStamp + '--' + _paySign);
    var _timeStamp = _timeStamp.toString();
    wx.requestPayment({
      timeStamp: _timeStamp, //时间戳
      nonceStr: _nonceStr, //随机字符串
      package: _package, //统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=***
      signType: _signType,
      paySign: _paySign, // 签名
      total_fee: _totalFee,
      success: function(res) {
        console.log("支付成功，返回的信息为");
        //接下来进行payOrder接口的请求,在接口请求成功后再跳转到支付成功页面
        that.requestPayOrder();
      },
      fail: function(res) {
        console.log("失败，返回的数据为");
        console.log(res);
        wx.redirectTo({
          url: '../OrderDetail/OrderDetail',
        })
      }
    })
    // if (false) { //支付成功了
    //   wx.reLaunch({
    //     url: '../PaySuccess/PaySuccess',
    //   })
    // } else { //支付失败了
    //   wx.redirectTo({
    //     url: '../OrderDetail/OrderDetail',
    //   })
    // }
  },

  requestPayOrder: function() {
    var that = this;
    wx.showLoading({
      title: '',
    })
    wx.request({ //点击立即购买后进行的接口请求
      url: app.globalData.url + '/mobile//index.php?m=flowerapi&c=order&a=payorder',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        uid: app.globalData.uId,
        order_id: app.globalData.order_id
      },
      success: function(res) {
        wx.hideLoading();
        wx.redirectTo({
          url: '../PaySuccess/PaySuccess',
        })
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '购买成功，但修改订单状态失败，请与客服联系',
          icon: 'none'
        })
      }
    })
  },

  delPhone:function(aim){    //对电话号码进行一个处理
    var a = aim;
    a = a.toString();
    var first = a.substr(0, 3);
    var last = a.substr(7);
    var b = first + "****" + last;
    return b;
  }

})