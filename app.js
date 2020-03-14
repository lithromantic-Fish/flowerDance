var app = getApp();

App({
  onLaunch: function (option) {
   
  },
  globalData: {
    // url: "https://flower.transtive.com",    //全局的URL
    // url: "http://47.89.15.170:8081",    //全局的URL
    url: "https://a.com1221.com",    //全局的URL
    // url:"http://www.flower.com",
    uId: wx.getStorageSync('uId') ? wx.getStorageSync('uId'):"",             //记录当前登陆者信息
    globalAddrId: "",     //记录修改或新增地址的id
    order_id: "",       //记录当前的订单id    
    nowStatus: "",       //记录当前订单的状态
    myOrderStatus: "",    //记录当前付款单是哪一个，全部还是待付款等。

    //个人中心那里分类的类型 状态：1代付款，2待发货，3待收货，4待评价，5已完成，6已取消 不填默认全部
    myGoodsType: "",

    homePhone: "",      //联系客服所拨打的电话

    addrFrom: "",       //进入选择收获地址从哪个地方进来，1表示从订单进来，2表示从我的地址里面进来

    province: "",       //记录从收货地址到订单的省份等信息
    city: "",
    area: "",
    name:"",
    phone:"",  
    addrDetail: "",
    addrId: "",

    orderFrom: "",    //表示未生成订单的订单页从哪里来，1表示从地址页过来，2表示从详情页过来

    myIntegral: "",   //存储积分的总值

    //进行一个简单的整理，关于商品的状态的
    goodsType: "",     //记录该商品是属于普通（1），秒杀（2），还是团购（3） 4 -- 订阅花  5--当日达
    goodsOrPageId: "",    //记录商品或者文章id
    //支付方式那里，记录当前的支付方式，是积分还是金额,默认为金额支付
    actId: "",  //用于记录团购或者秒杀的id
    catId: "",        //用来记录当前商品的分类
    todayId: "",   // 记录当日达id
    subId: "",      //记录订阅花id
    howId: "", //一个月几束id
    whenId: "",   //收花日id
    skus:[],    //商品规格
    //地址那里，在保存后回到列表页，列表页进行一个自刷新，但是需要知道是不是从编辑/新增回到列表
    addrListFrom:0 ,      //初始值为0，1表示从编辑/新增进来，需要页面自刷新  

    pageListFromDetail:0,    //文章列表页是否从详情页过来，如果是，刷新列表页一次 

    orderDetailFromList:0,  //判断订单详情是否是从订单详情页过来，如果是，则重启到个人中心页
    //这个字段专门为了删除订单而设置

    shareKind:"",     //分享的类型，1--文章  2--实物  “”--nothing  0--普通转发,转发当前小程序

    fromLogin:"0",   //是否从登录页返回回来,1表示是
  },

})