// pages/FullLocation/FullLocationPage.js

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */


  data: {
    addrName: "",
    addrMobile: "",
    display: "none",
    provinces: "", //逻辑里存储的省的数组
    citys: "",
    districts: "",
    province: "", //逻辑里存储的当前选中的省的名字
    city: "",
    district: "",
    province_id: "", //逻辑里选中的当前省的id
    real_province_id: "", //逻辑点点击完成后真正的传值的id
    city_id: "",
    real_city_id: "",
    district_id: "",
    real_district_id: "",
    addrSmall: "",

    showLocation: 0 //这个是控制显示收货地址的，默认不显示
  },
  /**
   * 生命周期函数--监听页面加载
   * 此页面bug1：省市区必须选择完再点击确认,不然出错
   */
  onLoad: function(options) {
    var that = this;
    //进入该页面将addrListFrom置为1，表示从编辑/新增回到地址列表页
    app.globalData.addrListFrom = 1;

    that.getHeight(); //获取屏幕的高度，并放在底部
    //如果有app.globalData.globalAddrId，就为编辑操作
    if (app.globalData.globalAddrId) {
      that.setData({
        addrId: app.globalData.globalAddrId
      });
      that.getAddrMessage();
    }
  },

  //下面3个函数对联系人，手机号，详细地址信息进行保存
  addrName: function(e) {
    var that=this;
    //不仅将数据放入input里面，同时逻辑里面修改数据
    that.data.addrName = e.detail.value;
    this.setData({
      addrName: e.detail.value
    })
  },

  addrMobile: function(e) { //对手机号码做一个检查，如果不是数字，就不允许
    var that = this;
    that.data.addrMobile = e.detail.value;
    that.setData({
      addrMobile: e.detail.value
    })
  },

  addrSmall: function(e) {
    var that=this;
    that.data.addrSmall = e.detail.value;
    that.setData({
      addrSmall: e.detail.value
    })
  },


  saveAddr: function() {
    var that = this;
    //有id时编辑的保存接口
    if (!that.data.addrName || !that.data.addrMobile || !that.data.locationMain || !that.data.addrSmall) {
      that.setData({
          showMessage: "请将信息完善后再保存",
          display: "flex",
        }),
        setTimeout(function() {
          that.setData({
            showMessage: "",
            display: "none",
          })
        }, 1000)
    } else {
      //对电话号码进行一个检查，不是电话号码则不能通过
      var value = that.data.addrMobile;
      if (!(/^1[3456789]\d{9}$/.test(value))) {
        wx.showModal({
          content: '手机号码填写有误',
        })
      } else {
        if (app.globalData.globalAddrId) {
          that.saveEdit();
        } else { //无id是新增的保存接口
          that.saveNew();
        }
      }
    }
  },

  chooseProvince: function(e) {
    var that = this;
    var val = e.detail.value;

    if (val[0] == 0) { //选择了请选择，则将市和区的数据清空，并且将id值也清空,名字也清空
      that.data.districts = "";
      that.data.citys = "";
      that.data.district_id = '';
      that.data.city_id = "";
      that.data.city = "";
      that.data.district = "";
      that.setData({
        cityList: that.data.citys,
        districtList: that.data.districts
      })
    } else { //选择了某一个省份
      var region_id = that.data.provinces[val[0] - 1].region_id;
      wx.showLoading({
        title: '数据加载中',
      })
      wx.request({
        url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=threelevel&uid=' + app.globalData.uId,
        data: {
          id: region_id
        },
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        success: function(res) {
          wx.hideLoading();

          that.data.province = that.data.provinces[val[0] - 1].region_name;
          that.data.province_id = region_id;

          //对区进行一个置空的操作
          that.data.district = "";
          that.data.districts = "";
          that.data.district_id = '';
          that.setData({
            districtList: that.data.districts
          })

          //对市进行放入,同时默认选择市的'请选择'
          that.data.citys = res.data.data;
          that.setData({
            cityList: res.data.data,
            cityValue:[0]
          })
        },
        fail: function(res) {
          wx.hideLoading();
          wx.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
        }
      })
    }
  },

  chooseCity: function(e) {
    var that = this;
    var val = e.detail.value;

    //先判断是否是请选择，如果是，将区的数据进行清空
    if (val[0] == 0) {
      that.data.district = "",
        that.data.district_id = "",
        that.data.districts = "",
        that.setData({
          districtList: that.data.districts
        })
    } else { //否则的话对区的数据进行放入
      var region_id = that.data.citys[val[0] - 1].region_id;
      wx.showLoading({
        title: '数据加载中',
      })
      wx.request({
        url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=threelevel&uid=' + app.globalData.uId,
        data: {
          id: region_id
        },
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        success: function(res) {
          wx.hideLoading();

          //对选中的市进行赋值
          that.data.city = that.data.citys[val[0] - 1].region_name;
          that.data.city_id = region_id;

          //将区放入进去
          that.data.districts = res.data.data;
          that.setData({
            districtList: res.data.data
          })
        },
        fail: function(res) {
          wx.hideLoading();
          wx.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
        }
      })
    }
  },
  chooseDistrict: function(e) {
    var that = this;
    var val = e.detail.value;
    //如果滑动到区的已选择，将自己的id清空一次，主要为了点击完成的判断
    if (val[0] == 0) {
      that.data.district_id = "";
      that.data.district="";
    }else {
      //将选中的区的数据进行赋值
      var region_id = that.data.districts[val[0] - 1].region_id;
      that.data.district = that.data.districts[val[0] - 1].region_name;
      that.data.district_id = region_id;
    }
  
  },

  getAddrMessage: function() { //如果有地址信息，就拿到然后放到页面
    var that = this;
    wx.showLoading({
      title: '数据加载中',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=addressdetail&id=' + app.globalData.globalAddrId + "&uid=" + app.globalData.uId,
      method: "GET",
      success: function(res) {
        //对省市区进行一个处理
        wx.hideLoading();
        var province = res.data.data.province;
        var city = res.data.data.city;
        var district = res.data.data.district;

        var result = province + "省 " + city + "市 " + district;

        that.setData({
          addrName: res.data.data.consignee,
          addrMobile: res.data.data.mobile,
          locationMain: result,
          addrSmall: res.data.data.address
        })

        //将数据放进去的同时，逻辑上的数据也进行放入
        that.data.addrName = res.data.data.consignee;
        that.data.addrMobile = res.data.data.mobile;
        that.data.addrSmall = res.data.data.district;
        that.data.real_province_id = res.data.data.province_id;
        that.data.real_city_id = res.data.data.city_id;
        that.data.real_district_id = res.data.data.district_id;
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '获取地址信息失败',
          icon: 'none',
        })
      }
    })
  },

  getProvince: function() { //初始进入将省的信息放入
    var that = this;
    wx.showLoading({
      title: '数据加载中',
    })
    wx.request({
        url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=threelevel&uid=' + app.globalData.uId,
        method: "POST",
        data: {
          id: ""
        },
        success: function(res) {
          wx.hideLoading();
          that.data.provinces = res.data.data;
          that.data.province_id = res.data.data[0].region_id;
          that.setData({
            provinceList: res.data.data
          })
        },
        fail: function(res) {
          wx.hideLoading();
          wx.showToast({
            title: '省份地区加载失败',
            icon: 'none'
          })
        }
      }),

      wx.getSystemInfo({
        success: res => {
          that.setData({
            //windowHeight 为屏幕可用高度
            height: res.windowHeight + "px",
          })
        }
      })
  },

  saveEdit: function() { //编辑的时候点击保存
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=editaddress&uid=' + app.globalData.uId,
      method: "POST",
      data: {
        id: app.globalData.globalAddrId,
        consignee: that.data.addrName,
        mobile: that.data.addrMobile,
        province: that.data.real_province_id,
        city: that.data.real_city_id,
        district: that.data.real_district_id,
        address: that.data.addrSmall
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        if(res.data.code==200){
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            success: function () {   //接口调用后
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }else {
          wx.showToast({
            title: res.data.msg,
            icon:'none'
          })
        }
      },
      fail: function() {
        wx.showToast({
          title: '保存失败',
          icon:'none'
        })
      }
    })
  },

  saveNew: function() { //新增的时候点击保存
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=address&a=addaddress&uid=' + app.globalData.uId,
      method: "POST",
      data: {
        consignee: that.data.addrName,
        mobile: that.data.addrMobile,
        province: that.data.real_province_id,
        city: that.data.real_city_id,
        district: that.data.real_district_id,
        address: that.data.addrSmall
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          success: function () {   //接口调用后
            wx.navigateBack({
              delta: 1
            })
          }
        })
      },
      fail: function() {
        wx.showToast({
          title: '保存失败',
          icon:'none'
        })
      },
    })
  },

  getHeight: function() { //获得屏幕的高度
    var that = this;
    wx.getSystemInfo({ 
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight + "px"
        })
      },
    })
  },

  //当点击删除的时候将地址的选择框隐藏
  hideAddr: function() {
    var that = this;
    that.setData({
      showLocation: 0
    })
  },

  //当点击收货地址的时候将其显示,并将省的数据初始放入,将其他数据清空
  showAddr: function() {
    var that = this;
    //刚开始进入对省进行请求
    that.getProvince();

    that.data.city_id = ''; //将省市的值都置为空
    that.data.district_id = '';
    that.setData({ //初始化市区的数据
      cityList: "",
      districtList: "",
      showLocation: 1
    })
  },

  confirmLocation: function() { //当地址确定并点击了确认事件后的操作
    var that = this;
    if (that.data.province_id == '' || that.data.city_id == '' || that.data.district_id == '') { //必须将信息填写完才能完成
      wx.showToast({
        title: '请将信息完善',
        icon: 'none'
      })
    } else {
      that.data.real_province_id = that.data.province_id;
      that.data.real_city_id = that.data.city_id;
      that.data.real_district_id = that.data.district_id;
      var str = that.data.province + "省 " + that.data.city + "市 " + that.data.district;

      that.setData({
        locationMain: str,
        showLocation: 0
      })
    }
  }
})