// pages/OrderDetail/OrderDetail.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    display: "none",
    curDisplay: "none",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    


    var that = this;

    //获取手机屏幕的高度以处理幕布
    var height = wx.getSystemInfoSync().windowHeight;
    that.setData({
      curHeight: height + "px"
    })

    //获取订单信息
    that.getOrderDetail();
  },

  getOrderDetail: function() {
    var that = this;
    wx.showLoading({
      title: '获取订单信息中',
    })
    var parm = {
        order_id : app.globalData.order_id,
        uid : app.globalData.uId
    }
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=order&a=orderdetail',
      method: "GET",
      data: parm,
      success: function(res) {
        wx.hideLoading();
        var status = res.data.data.type;
        that.setData({
          nowStatus: res.data.data.type
        });
        //对显示的文字进行处理
        //根据type的值来进行处理
        //"type": null, //当前订单状态：1代付款，2待发货，3待收货，4待评价，5已完成，6已取消
        // "pay_type": 1,  //支付方式：1金额支付（微信），积分支付
        var text1, text2;
        if (status == 1) {
          text1 = "待付款";
          text2 = "付款完成后，1-12小时内发货";
        } else if (status == 2) {
          text1 = "待发货";
          text2 = "请耐心等待商家发货";
        } else if (status == 3) {
          text1 = "待收货";
          text2 = "预计1-7个工作日送达";
        } else if (status == 4) {
          text1 = "待评价";
          text2 = "商家期待您宝贵的评价";
        } else if (status == 5) {
          text1 = "已完成";
          text2 = "感谢您在清棠花社购物，记得常来喔~";
        } else if (status == 6) {
          text1 = "已取消";
          text2 = "超过付款时间自动取消订单";
        }

        //对电话号码进行处理
        if (res.data.data.mobile) {
          var first = res.data.data.mobile.substring(0, 3);
          var last = res.data.data.mobile.substring(7, 11);
          var mobile = first + "****" + last;
        } else {
          var mobile = res.data.data.mobile;
        }

        //对地址进行处理
        var province = res.data.data.area[0].region_name + "省";
        var country = res.data.data.area[1].region_name + "市";
        var posi = res.data.data.area[2].region_name;
        var location = province + " " + country + " " + posi + "  " + res.data.data.address;

        //对支付方式进行处理,并同时对实付款进行管理
        var pay_way, realPrice;
        if (res.data.data.pay_type) {
          if (res.data.data.pay_type == 1) {
            pay_way = "金额支付";
            realPrice = res.data.data.price;
          } else {
            pay_way = "积分支付";
            realPrice = 0;
          }
        }

        //对积分进行处理
        if (res.data.data.pay_type == 2) { //2是积分支付
          var pay_number = "-" + res.data.data.integral + "积分";
          that.setData({
            integral: res.data.data.integral //如果是积分支付，将积分值放入
          })
        } else if (res.data.data.pay_type == 1) { //1是金额支付
          var pay_number = "-0积分";
        }

        that.setData({
          text1: text1, //以上信息是所有单子都共同的
          text2: text2,
          consignee: res.data.data.consignee,
          mobile: mobile,
          goods_name: res.data.data.goods_name,
          location: location,
          price: res.data.data.price,
          img: res.data.data.img,
          realPrice: realPrice,


          order_sn: res.data.data.order_sn,
          add_time_str: res.data.data.add_time_str,
          invoice_no: res.data.data.invoice_no,
          pay_way: pay_way, //做了判断
          freight: res.data.data.freight, //运费
          pay_number: pay_number //积分的处理**做了判断
        })
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '订单信息获取失败',
          icon: 'none'
        })
      }
    })
  },

  ToEvaluate: function() {
    var that = this;
    wx.navigateTo({
      url: '../Evaluate/EvalutePage',
    })
  },

  confirmGet: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=order&a=receive',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        order_id: app.globalData.order_id,
        // order_id: 33,
        uid: app.globalData.uId
      },
      success: function(res) {
        if (res.data.code == 200) {
          that.setData({
            curMessage: "收货成功",
            curDisplay: "block",
          })
          app.globalData.nowStatus = 4;
          that.onLoad();
        }
      },
      fail: function(res) {
      }
    })
  },

  toPay: function() {
    var that = this;
    console.log("即将传入的order_id为");
    console.log(app.globalData.order_id + '---' + app.globalData.uId);
    wx.request({
      url: app.globalData.url + '/mobile//index.php?m=flowerapi&c=order&a=getpayorderjs',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        order_id: app.globalData.order_id,
        uid: app.globalData.uId
      },
      success: function(res) {
        var str;
        if (res.data.code == 200) {
          app.globalData.nowStatus = 2; //将全局订单的状态改为2
          var _timeStamp = res.data.data.timeStamp.toString();

          wx.requestPayment({
            timeStamp: _timeStamp,     //时间戳
            nonceStr: res.data.data.nonceStr,   //随机字符串
            package: res.data.data.package,   
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,    // 签名
            success(res) {   //成功了启动到支付成功页面,并请求payOrder的接口,如果支付成功
            //则跳转到成功页并请求接口
              that.requestPayOrder();
            },
            fail(res) {      //取消不做任何操作
            }
          })
        } else {
          var str="";
          if (res.data.code == 0) {
            str = "缺少参数或者该订单不存在";
          } else if (res.data.code == 202) {
            str = "该订单已支付"
          } else if (res.data.code == 203) {
            str = "该商品已售空"
          } else {
            str = "信息错误"
          }
          wx.showToast({
            title: str,
            icon:'none'
          })
        }
      },
      fail: function(res) {
        wx.showToast({
          title: '付款失败',
          icon: 'none'
        })
      }
    })
  },


  //下面为取消订单的操作
  cancelOrder: function() {
    var that = this;
    wx.showLoading({
      title: '订单取消中',
    })
    wx.request({
      url: app.globalData.url + "/mobile/index.php?m=flowerapi&c=order&a=cancelOrder",
      method: 'POST',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        order_id: app.globalData.order_id,
        uid: app.globalData.uId
      },
      success: function() {
        wx.hideLoading();
        app.globalData.nowStatus = 6;
        that.setData({
          nowStatus: 6,
        })
        wx.showToast({
          title: '订单取消成功',
          icon: 'none'
        })
        that.onLoad();
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: '订单取消失败',
          icon: 'none'
        })
      }
    })
  },

  //下面为删除订单的操作
  delOrder: function() {
    var that = this;
    wx.showLoading({
      title: '订单删除中',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=order&a=delete',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        order_id: app.globalData.order_id,
        uid: app.globalData.uId
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          wx.showToast({
            title: '删除订单成功',
            icon: 'success',
            success: function() {
              //从删除订单页过去订单列表页时，将该数据设置为1，方便在回退的时候检测该值，如果为1
              //则置0，同时回到个人中心页
              app.globalData.orderDetailFromList = 1;
              wx.navigateTo({
                url: '../AllOrde/AllOrderPage',
              })
            }
          })
        } else {
          var str;
          if (res.data.code == 201) str = "该订单不存在";
          else if (res.data.code == 202) str = "该订单已支付无法删除";
          else if (res.data.code == 0) str = "订单删除失败";
          wx.showToast({
            title: str,
            icon: 'none',
          })
        }
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '删除订单失败',
          icon: 'none'
        })
      }
    })
  },


  curHide: function() {
    var that = this;
    that.setData({
      curMessage: "",
      curDisplay: "none",
    })
  },

  //复制物流单号
  copyInvoice: function() {
    var that = this;
    wx.setClipboardData({
      data: that.data.invoice_no
    })
  },

  //复制订单编号
  copySn: function() {
    var that = this;
    wx.setClipboardData({
      data: that.data.order_sn
    })
  },

  connectHome: function() {
    var that = this;
    wx.request({
      method: "GET",
      url: app.globalData.url + "/mobile/index.php?m=flowerapi&c=goods&a=servicephone&&uid=" + app.globalData.uId,
      success: function(res) {
        wx.showModal({
          content: res.data.data.service_phone,
          cancelText: "取消",
          confirmText: "拨打",
          success(res) {
            if (res.confirm) {
              wx.makePhoneCall({
                phoneNumber: res.data.data.service_phone
              })
            } else if (res.cancel) {

            }
          }
        })
      },
      fail: function() {
        wx.showToast({
          title: '获取客服电话信息失败',
          icon: 'none'
        })
      }
    })

  },

  onShow: function() {
    var that = this;
    if (app.globalData.orderDetailFromList == 1) {
      app.globalData.orderDetailFromList = 0;
      wx.reLaunch({
        url: '../My/MyPage',
      })
    }
  },

  requestPayOrder: function () {
    var that = this;
    wx.showLoading({
      title: '页面跳转中..',
    })
    console.log("即将传入的订单信息为:");
    console.log(app.globalData.order_id)
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
      success: function (res) {
        wx.hideLoading();
        if(res.data.code==200){
          wx.redirectTo({
            url: '../PaySuccess/PaySuccess',
          })
        }else {
          wx.showToast({
            title: '支付成功，但修改订单状态失败，请与客服联系',
            icon: 'none'
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: '支付成功，但修改订单状态失败，请与客服联系',
          icon: 'none'
        })
      }
    })
  }

})