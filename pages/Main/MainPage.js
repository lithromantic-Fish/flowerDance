//index.js
//获取应用实例

var app = getApp();

Page({
  data: {
    currentTab: 0,
    navScrollLeft: 0,
    display: "none",
    groupIndex: 1,
    spikeIndex: 1,
    newIndex: 1,
    hotIndex: 1,
    findIndex: 1,
    topChoose: -1, //上边商品分类默认选中第一个   
    topCatList: [], //记录上边的商品分类的cat_id
    topIsChoose: [],
    groupList: [], //存储限时团购的数据,并有时时刷新的可能
    spikeList: [], //存储秒杀的数据，并有时时刷新的可能

    showGroup: 1, //是否显示团购
    showSpike: 1, //是否显示秒杀 ,默认初始都显示
    showNew: 1, //是否显示新品专区
    showHot: 1, //是否显示热卖专区
    showFind: 1, //是否显示发现好物

    goodsPages: [1, 1, 1, 1, 1],
    //每一个的页数，依次为团购，秒杀，新品，热卖，发现好物

    haveRequestGroup: [], //记录是否请求过团购数据，没有则请求,有则不请求
    //这里用来做分页，当滑动回来的时候如果请求过了不重复请求,下面一样
    haveRequestNew: [],
    haveRequestSpike: [],
    haveRequestHot: [],
    haveRequestFind: [],

    pageCount: [],
    //记录总的页数，依次为团购，秒杀，新品，热卖，发现好物

    nowGoodsPage: 1, //记录右边商品当前页,开始默认为0页
  },


  //事件处理函数
  onLoad: function(options) {
    var that = this;
    

    wx.showShareMenu({ //将小程序的转发按钮显示出来
      withShareTicket: true
    })

    //对文章分享进行一个处理,如果kind有值，则跳转到登录，然后由登录页到文章详情页
    var kind=options.kind;
    var id=options.id;
    app.globalData.goodsOrPageId=id;
    app.globalData.shareKind=kind;
    if(kind){
       wx.navigateTo({
         url: '../Login/LoginPage?kind='+kind+"&id="+id,
       })
    }

    that.startConnect();


    //设置高度
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    });

  },

  onShow: function(options) { 
    
  },

  startConnect: function() {
    var that = this;

    that.getPhone(); //获取客服电话

    that.requestTopList();


    //秒杀的接口
    that.requestSpike();

    //新品专区的接口
    that.requestNew();

    //热卖专区  
    that.requestHot();

    //发现好物的接口 
    that.requestFind();

    // requestGoodsList();请求物品列表的接口


  },


  clickImg: function(e) {
    var that = this;
    var message = e.target.dataset.imgsrc;
    var img_type = message.split(":")[0];
    app.globalData.goodsOrPageId = message.split(":")[1]; //记录当前的goodsid

    if (app.globalData.goodsType == 4) {
      app.globalData.subId = message.split(":")[3]; //3--订阅花，记录订阅花id
      //并清除当日达的id,因为下一个页面请求的时候当日达id也会拼接上去
      app.globalData.todayId = "";
    } else if (app.globalData.goodsType == 5) { //2--当日达
      app.globalData.todayId = message.split(":")[2];
      //并清除订阅花的id,因为下一个页面请求的时候订阅花id也会拼接上去
      app.globalData.subId = "";
      //清除订阅花的收花日以及收花方式的id，因为生成订单要共用
      app.globalData.howId = "",
        app.globalData.whenId = ""
    } else {
      app.globalData.goodsType = 1; //如果都没有则为普通商品
      //清除订阅花和当日达的id，因为请求商品详情的接口要用
      app.globalData.todayId = "";
      app.globalData.subId = "";
      //清除订阅花的收花日以及收花方式的id，因为生成订单要共用
      app.globalData.howId = "",
        app.globalData.whenId = ""
    }


    if (img_type == 1) {
      wx.navigateTo({
        url: "../GoodsDetail/DetailPage"
      })
    } else if (img_type == 2) {
      wx.navigateTo({
        url: "../EssayDetail/EssayDetailPage"
      })
    }
  },


  changeEnd: function(e) {
    var that = this;
    var index = e.detail.current + 1;
    if (index % 4 == 0 && that.data.haveRequestGroup[index] != 1 && (that.data.pageCount[0] - index) > 1)
    //3个条件 1.快要到下一页  2.没有加载过下一页 3.还有下一页
    {
      that.data.haveRequestGroup[index] = 1; //记录已经加载过当前页
      that.requestGroup();
    }

    var that = this;
    that.setData({
      groupIndex: index
    })
  },

  spikeChangeEnd: function(e) {
    var that = this;
    var index = e.detail.current + 1;
    if (index % 4 == 0 && that.data.haveRequestSpike[index] != 1 && (that.data.pageCount[1] - index) > 1)
    //3个条件 1.快要到下一页  2.没有加载过下一页 3.还有下一页
    {
      that.data.haveRequestSpike[index] = 1; //记录已经加载过当前页
      that.requestSpike();
    }

    var that = this;
    that.setData({
      spikeIndex: index
    })
  },

  newChangeEnd: function(e) {
    var that = this;
    var index = e.detail.current + 1;
    if (index % 4 == 0 && that.data.haveRequestNew[index] != 1 && (that.data.pageCount[2] - index) > 1)
    //3个条件 1.快要到下一页  2.没有加载过下一页 3.还有下一页
    {
      that.data.haveRequestNew[index] = 1; //记录已经加载过当前页
      that.requestNew();
    }

    that.setData({
      newIndex: index
    })
  },

  hotChangeEnd: function(e) {
    var that = this;
    var index = e.detail.current + 1;
    if (index % 4 == 0 && that.data.haveRequestHot[index] != 1 && (that.data.pageCount[3] - index) > 1) {
      that.data.haveRequestHot[index] = 1; //记录已经加载过当前页
      that.requestHot();
    }
    that.setData({
      hotIndex: index
    })
  },

  findChangeEnd: function(e) { //滑动的时候对于事件的处理，如果滑动到第4张，继续加载
    var that = this;
    var index = e.detail.current + 1;
    if (index % 4 == 0 && that.data.haveRequestFind[index] != 1 && (that.data.pageCount[4] - index) > 1) {
      that.data.haveRequestFind[index] = 1; //记录已经加载过当前页
      that.requestFind();
    }
    that.setData({
      findIndex: index
    })
  },

  swiperchange: function(e) {
    var that = this;
    that.data.nowGoodsPage = 1; //滑动过去的时候将分页页数设置为1
    var cur = parseInt(e.detail.current);
    that.data.topChoose = parseInt(cur) - 1;
    this.setData({
      topChoose: cur - 1,
    });

    if (cur == 0) { //回到首页，将订阅花和当日达的状态清除,并且禁止加载数据的接口清除
      app.globalData.goodsType = 1; //初始为普通商品的状态
      var len = that.data.topCatList.length;
      for (var i = 0; i < 7; i++) {
        that.data.topIsChoose[i] = 0;
      }
    }

    app.globalData.catId = that.data.topCatList[cur - 1];
    //根据topChoose的值进行滑动
    that.setData({
      toIndex: ('top' + that.data.topChoose)
    })



    if (that.data.topChoose != -1 && that.data.topIsChoose[cur] != 1) {
      that.data.topIsChoose[cur] = 1;
      that.requestGoodsList();
    }
  },

  toGroupBuyPage: function(e) {
    var id = e.currentTarget.dataset.lockerid;
    app.globalData.goodsType = 3;
    app.globalData.actId = id;
    wx.navigateTo({
      url: "../GoodsDetail/DetailPage"
    })
  },

  toSpikePage: function(e) {
    var id = e.currentTarget.dataset.lockerid;
    app.globalData.goodsType = 2;
    app.globalData.actId = id;
    wx.navigateTo({
      url: "../GoodsDetail/DetailPage"
    })
  },


  topClick: function(e) { //上面的标签的点击事件
    var that = this;
    that.data.nowGoodsPage = 1; //点击了上面任意一个初始页设置为1, 下拉页数才增加
    var topChoose = e.currentTarget.dataset.lockerid.split(":")[1];
    that.setData({
      currentTab: parseInt(topChoose) + 1,
      topChoose: parseInt(topChoose)
    });


    if (topChoose == -1) { //回到首页，将订阅花和当日达的状态清除,并且禁止加载数据的接口清除
      app.globalData.goodsType = 1;
      for (var i = 0; i < 7; i++) {
        that.data.topIsChoose[i] = 0;
      }
    }

    var cat_id = parseInt(e.currentTarget.dataset.lockerid.split(":")[0]);
    var index = parseInt(e.currentTarget.dataset.lockerid.split(":")[1]);
    app.globalData.catId = cat_id;
    if (cat_id != -1 && that.data.topIsChoose[index] != 1) { //推荐和已经请求过接口不用再请求
      that.data.topIsChoose[index] = 1;
      // 商品列表的接口 
      // that.requestGoodsList(); //这里是点击后请求
    }
  },

  //商品列表接口
  requestTopList: function() {
    var that = this;
    wx.showLoading({
      title: '数据请求中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=goodscatlist&uid=' + app.globalData.uId,
      method: "GET",
      success: function(res) {
        var catList = new Array();
        var len = res.data.data.length;
        for (var i = 0; i < len; i++) {
          that.data.topCatList[i] = res.data.data[i].cat_id;
        }

        that.setData({
          catList: res.data.data
        })

        //轮播图的接口,请求后请求该请求
        that.requestBanner();
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '顶部标签请求失败',
          icon: 'none'
        })
      }
    })
  },

  //轮播图接口
  requestBanner() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=indexmenu&a=shufflinglist&uid=' + app.globalData.uId,
      method: "GET",
      success: function(res) {
        that.setData({
          scrollImage: res.data.data,
        })

        //订阅花和当日达的接口
        that.requestArrival();
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: '轮播图信息获取失败',
          icon: 'none'
        })
      }
    })
  },

  //订阅花和当日达的接口
  requestArrival: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=indexmenu&a=home',
      method: "POST",
      data: {
        uid: app.globalData.uId
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },

      success: function(res) {

        //在这里对订阅花和当日达的图片进行处理,如果没有则显示默认图片
        res.data.data[1].img = "../Images/arrival-today.jpg";
        that.setData({
          orderArrive: res.data.data
        })

        //最后请求限时团购的接口
        that.requestGroup();
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '获取订阅花，当日达信息失败',
          icon: 'none'
        })
      }
    })
  },

  //限时团购的接口  //aaa
  requestGroup: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=indexmenu&a=groupby',
      method: "POST",
      data: {
        page: that.data.goodsPages[0],
        uid: app.globalData.uId
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        wx.hideLoading();
        that.data.goodsPages[0]++;
        var len = res.data.data.list.length;
        var groupLength = res.data.data.count;
        that.data.pageCount[0] = groupLength;
        if (groupLength == 0) { //有下一页的时候才进行请求，否则不会进行无用的请求，所以只有可能第一次请求进入这里
          that.setData({
            showGroup: 0
          })
        } else {
          //先获取当前时间的时间戳，单位为秒
          var now = new Date().getTime();
          now = parseInt(now / 1000);
          for (var i = 0; i < len; i++) {
            //对时间进行一个处理,将剩余时间以秒的形式存放起来,并且将转换后的时间放在页面上
            var group_time = res.data.data.list[i].end_time - now;
            //在返回的字段中多加2个字段，一个是剩下的时间的秒数(restTime)，一个是它的转换后的时间(groupTime)
            res.data.data.list[i].restTime = parseInt(group_time);
            var time = that.secToTime(group_time); //将秒转为天-时-分
            res.data.data.list[i].group_time = time;
          }

          if (that.data.goodsPages[0] == 2) { //第一次加载数据，直接放入
            that.data.groupList = res.data.data.list;
            that.setData({
              groupList: res.data.data.list,
              groupLength: groupLength,
            })

            //只有第一次才进行倒计时
            that.countDown();

          } else { //第二次加载，将数据填入
            that.data.groupList.push(...res.data.data.list);
            that.setData({
              groupList: that.data.groupList
            })
          }
        }
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '请求限时团购数据失败',
          icon: 'none'
        })
      }
    })
  },

  //秒杀的接口
  requestSpike: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=indexmenu&a=skill',
      method: "POST",
      data: {
        page: that.data.goodsPages[1],
        uid: app.globalData.uId
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },

      success: function(res) {
        that.data.goodsPages[1]++;
        var spikeLength = res.data.data.count;
        that.data.pageCount[1] = spikeLength;
        if (spikeLength == 0) { //如果秒杀为空，则隐藏
          that.setData({
            showSpike: 0
          })
        } else { //只反了一个截止时间，acti_time，需要根据此时间算出倒计时
          var len = res.data.data.list.length;
          for (var i = 0; i < len; i++) {
            var now = new Date().getTime();
            now = parseInt(now / 1000);
            var cut_time = res.data.data.list[i].acti_time;
            cut_time = that.DateToUnix(cut_time); //将时间转换为时间戳，单位是秒
            var spike_time = cut_time - now;
            res.data.data.list[i].restTime = parseInt(spike_time);
            res.data.data.list[i].spikeTime = that.secToTime(spike_time);
          }
          if (that.data.goodsPages[1] == 2) { //第一次请求
            that.data.spikeList = res.data.data.list;
            that.setData({
              spikeLength: spikeLength,
              spikeList: res.data.data.list,
            })

            that.countDownSpike(); //只有第一次的时候才进行倒计时，否则倒计时会叠加
          } else { //请求的第二页或者更多页
            that.data.spikeList.push(...res.data.data.list);
            that.setData({
              spikeList: that.data.spikeList
            })
          }
        }
      },
      fail: function(res) {
        wx.showToast({
          title: '数据获取失败',
          icon: 'none'
        })
      }
    })
  },

  //新品的接口
  requestNew: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=indexmenu&a=newlist',
      method: "POST",
      data: {
        page: that.data.goodsPages[2],
        size: 5,
        type: 3,
        uid: app.globalData.uId
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        that.data.goodsPages[2]++; //页面加1,同时记录已经加载过当前页
        var newLength = res.data.data.count;
        that.data.pageCount[2] = newLength;
        if (newLength == 0) {
          that.setData({
            showNew: 0
          })
        } else { //数据不为空
          if (that.data.goodsPages[2] == 2) { //第一次加载数据，直接放入
            that.setData({
              newList: res.data.data.list,
              newLength: newLength,
            })
          } else { //第二次加载，将数据填入
            that.data.newList.push(...res.data.data.list);
            that.setData({
              newList: that.data.newList
            })
          }

        }
      },
      fail: function(res) {}
    })
  },

  //热卖的接口
  requestHot() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=indexmenu&a=newlist',
      method: "POST",
      data: {
        page: that.data.goodsPages[3],
        size: 5,
        type: 1,
        uid: app.globalData.uId
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        that.data.goodsPages[3]++;
        var hotLength = res.data.data.count;
        that.data.pageCount[3] = hotLength;
        var len = res.data.data.list.length;
        if (len == 0) {
          that.setData({
            showHot: 0
          })
        } else {
          if (that.data.goodsPages[3] == 2) { //第一次加载数据，直接放入
            that.setData({
              hotList: res.data.data.list,
              hotLength: hotLength,
            })
          } else { //第二次加载，将数据填入
            that.data.hotList.push(...res.data.data.list);
            that.setData({
              hotList: that.data.hotList
            })
          }
        }
      },
      fail: function(res) {}
    })
  },

  requestFind: function() { //请求发现好物里面的数据
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=indexmenu&a=newlist',
      method: "POST",
      data: {
        page: that.data.goodsPages[4],
        size: 5, //每一页请求的数据条数
        type: 2, //2为发现好物
        uid: app.globalData.uId
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        that.data.goodsPages[4]++;
        var findLength = res.data.data.count;
        that.data.pageCount[4] = findLength;
        var len = res.data.data.list.length;
        if (len == 0) {
          that.setData({
            showFind: 0
          })
        } else {
          if (that.data.goodsPages[4] == 2) { //第一次加载数据，直接放入
            that.setData({
              findList: res.data.data.list,
              findLength: findLength,
            })
          } else { //第二次加载，将数据填入
            that.data.findList.push(...res.data.data.list);
            that.setData({
              findList: that.data.findList
            })
          }

        }
      },
      fail: function(res) {}
    })
  },

  requestGoodsList: function() { //请求所有的商品信息列表
    var that = this;
    var goods_type; //1--普通  / 2--订阅花   3--当日达

    if (app.globalData.goodsType == 4) goods_type = 2;
    else if (app.globalData.goodsType == 5) goods_type = 3;
    else goods_type = 1;

    wx.showLoading({
      title: '数据加载中...',
    })
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=goodslist&cat_id=' + app.globalData.catId + "&goods_type=" + goods_type + "&uid=" + app.globalData.uId + "&page=" + that.data.nowGoodsPage,
      method: "GET",
      success: function(res) {
        wx.hideLoading();

        var len = res.data.data.length;
        if (len == 0) { //没有数据了
          wx.showToast({
            title: '没有更多的数据了',
            icon: 'none'
          })
          //同时将这一页的数据置为空,条件是第一页
          if (that.data.nowGoodsPage == 1) {
            switch (parseInt(that.data.topChoose)) {
              case 0:
                that.setData({
                  solo: ''
                })
                break;
              case 1:
                that.setData({
                  fix: ''
                })
                break;
              case 2:
                that.setData({
                  mini: ''
                })
                break;
              case 3:
                that.setData({
                  gift: ''
                })
                break;
              case 4:
                that.setData({
                  bottle: ''
                })
                break;
              case 5:
                that.setData({
                  ff: ''
                })
                break;
              case 6:
                that.setData({
                  green: ''
                })
                break;
            }
          }
        } else { //加载有更多数据
          switch (parseInt(that.data.topChoose)) {
            case 0:
              if (that.data.nowGoodsPage == 1) { //当前第一页，将数据直接放入
                that.setData({
                  solo: res.data.data
                });
              } else { //不是第一页对数据进行拼接
                var list = that.data.solo.concat(res.data.data);
                that.setData({
                  solo: list
                })
              }
              break;
            case 1:
              if (that.data.nowGoodsPage == 1) { //当前第一页，将数据直接放入
                that.setData({
                  fix: res.data.data
                });
              } else { //不是第一页对数据进行拼接
                var list = that.data.fix.concat(res.data.data);
                that.setData({
                  fix: list
                })
              }
              break;
            case 2:
              if (that.data.nowGoodsPage == 1) { //当前第一页，将数据直接放入
                that.setData({
                  mini: res.data.data
                });
              } else { //不是第一页对数据进行拼接
                var list = that.data.mini.concat(res.data.data);
                that.setData({
                  mini: list
                })
              }
              break;
            case 3:
              if (that.data.nowGoodsPage == 1) { //当前第一页，将数据直接放入
                that.setData({
                  gift: res.data.data
                });
              } else { //不是第一页对数据进行拼接
                var list = that.data.gift.concat(res.data.data);
                that.setData({
                  gift: list
                })
              }
              break;
            case 4:
              if (that.data.nowGoodsPage == 1) { //当前第一页，将数据直接放入
                that.setData({
                  bottle: res.data.data
                });
              } else { //不是第一页对数据进行拼接
                var list = that.data.bottle.concat(res.data.data);
                that.setData({
                  bottle: list
                })
              }
              break;
            case 5:
              if (that.data.nowGoodsPage == 1) { //当前第一页，将数据直接放入
                that.setData({
                  ff: res.data.data
                });
              } else { //不是第一页对数据进行拼接
                var list = that.data.ff.concat(res.data.data);
                that.setData({
                  ff: list
                })
              }
              break;
            case 6:
              if (that.data.nowGoodsPage == 1) { //当前第一页，将数据直接放入
                that.setData({
                  green: res.data.data
                });
              } else { //不是第一页对数据进行拼接
                var list = that.data.green.concat(res.data.data);
                that.setData({
                  green: list
                })
              }
              break;
          }
          that.data.nowGoodsPage++; //页数继续加
        }
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '数据请求失败',
          icon: 'none'
        })
      }
    })
  },

  //对时间进行一个处理,将秒数转换为天，时，分，秒
  secToTime: function(time) {
    var d = parseInt(time / (60 * 60 * 24));
    var h = parseInt(time % (60 * 60 * 24) / 3600);
    var m = parseInt(time % (60 * 60 * 24) % 3600 / 60);
    var s = parseInt(time % (60 * 60 * 24) % 3600 % 60);
    if (d < 10) d = "0" + d;
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    var str = d + "天" + h + "小时" + m + "分" + s + "秒";
    return str;
  },

  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },

  countDown: function() {
    var that = this;
    let len = that.data.groupList.length;

    for (var i = 0; i < len; i++) {
      that.data.groupList[i].restTime = parseInt(that.data.groupList[i].restTime) - 1;
      var time = parseInt(that.data.groupList[i].restTime);
      if (time > 0) {
        var day = parseInt(time / (60 * 60 * 24));
        var hou = parseInt(time % (60 * 60 * 24) / 3600);
        var min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
        var sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
        day = that.timeFormat(day);
        hou = that.timeFormat(hou);
        min = that.timeFormat(min);
        sec = that.timeFormat(sec);
      } else {
        var day = "00";
        var hou = "00";
        var min = "00";
        var sec = "00"; //会有一个误差时间，不主动刷新，当页面返回回来的时候的才刷新
      }
      var group_time = day + "天" + hou + "小时" + min + "分" + sec + "秒";
      that.data.groupList[i].group_time = group_time;
    }
    that.setData({
      groupList: that.data.groupList
    });
    setTimeout(that.countDown, 1000);
  },

  countDownSpike: function() {
    var that = this;
    var len = that.data.spikeList.length;
    for (var i = 0; i < len; i++) {
      that.data.spikeList[i].restTime = parseInt(that.data.spikeList[i].restTime) - 1;
      var time = parseInt(that.data.spikeList[i].restTime);
      if (time > 0) {
        var day = parseInt(time / (60 * 60 * 24));
        var hou = parseInt(time % (60 * 60 * 24) / 3600);
        var min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
        var sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
        day = that.timeFormat(day);
        hou = that.timeFormat(hou);
        min = that.timeFormat(min);
        sec = that.timeFormat(sec);
      } else {
        var day = "00";
        var hou = "00";
        var min = "00";
        var sec = "00";
      }
      var spike_time = day + "天" + hou + "小时" + min + "分" + sec + "秒";
      that.data.spikeList[i].spikeTime = spike_time;
    }
    that.setData({
      spikeList: that.data.spikeList
    });
    setTimeout(that.countDownSpike, 1000);
  },

  toRight: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.lockerid; //type为1则为当日达，为0为订阅花
    if (type == 0) app.globalData.goodsType = 4; //4为订阅花
    else if (type == 1) app.globalData.goodsType = 5; //5为当日达



    that.setData({
      currentTab: 1,
      topChoose: 0
    });

    app.globalData.catId = that.data.topCatList[0]; //记录当前商品的分类id以请求商品列表

    // that.requestGoodsList();   //滑动自动请求数据

  },


  //将时间转换为时间戳
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

  toLower:function(){
    var that = this;
    if (that.data.topChoose != -1) {
      that.requestGoodsList();
    }
  },
  

  //多增加一个获取客服电话，并把该电话放在全局
  getPhone: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/mobile/index.php?m=flowerapi&c=goods&a=servicephone&uid=' + app.globalData.uId,
      method: 'GET',
      success: function(res) {
        app.globalData.homePhone = res.data.data.service_phone;
      },
      fail: function(res) {}
    })
  },


  scrollToRight: function() { //当滑动条距离左边一定距离时设置一下滑动条的距离
    var that = this;
  },
  scrollToLeft: function() {},

  onShareAppMessage: function(res) { //转发的检测
    return {
      title: '菁棠花业',
      path: '/pages/Main/MainPage'
    }
  },


})