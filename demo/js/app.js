//定义工具函数
var Until = {
    //定义获取模板字符串函数
    tpl :function (id){
        return document.getElementById(id).innerHTML;
    },
    /* *定义ajax函数
     * *@url        请求地址
     * *@callback   请求成功的回调函数
     */
    ajax :function(url,callback){
        //创建xhr实例化对象
        var xhr = new XMLHttpRequest();
        //当发送请求时会触发onreadystatechange事件
        xhr.onreadystatechange = function(){
            //当readyState值为4时证明请求请求返回
            if(xhr.readyState ===4){
                //当status为200证明有数据返回
                if(xhr.status ===200){
                    //将得到的数据转为json对象
                    var data = JSON.parse(xhr.responseText);
                    //当传入回调函数是返回回调函数
                    callback && callback(data);
                }
            }
        };
        /** 请求参数
         *  第一个参数   请求类型
         *  第二个参数   请求地址
         *  第三个参数   是否异步
         */

        xhr.open("get",url,true);

        xhr.send(null);
    }
}

//创建组件
//home组件
var HomeComponent = Vue.extend({
    template: Until.tpl("tpl_home"),
    props: ['csearch',"sVla"],
    data: function () {
        return {
            types: [
                {id: 1, title: '美食', url: '01.png'},
                {id: 2, title: '电影', url: '02.png'},
                {id: 3, title: '酒店', url: '03.png'},
                {id: 4, title: '休闲娱乐', url: '04.png'},
                {id: 5, title: '外卖', url: '05.png'},
                {id: 6, title: 'KTV', url: '06.png'},
                {id: 7, title: '周边游', url: '07.png'},
                {id: 8, title: '丽人', url: '08.png'},
                {id: 9, title: '小吃快餐', url: '09.png'},
                {id: 10, title: '火车票', url: '10.png'}
            ],
            ad: [],
            list: [],
            banner:[]
        }
    },
    created:function () {
        console.log(this);
        var w = $(window).width();
        var _this = this;
        Until.ajax("data/home.json", function (res) {
            _this.ad = res.data.ad;
            _this.list = res.data.list;
            _this.banner = res.data.banner;
            var h = (_this.banner[0].height * w ) / _this.banner[0].width;
            for(var i = 0 ; i <　_this.banner.length ; i ++){
                _this.banner[i].viewWidth = w;
                _this.banner[i].viewHeight = h;
            }

        })
    }
});

//定义滤镜
Vue.filter("price",function(price){
    return price + "元";
});
Vue.filter("orignPrice",function(price){
    return "门市价" + price + "元";
})
Vue.filter("sales",function(num){
    return "已售" + num;
})
//list组件
var ListComponent = Vue.extend({
    template: Until.tpl("tpl_list"),
    props: ['csearch',"sVla"],
    data: function () {
        return {
            types: [
                {value: '价格排序', key: 'price'},
                {value: '销量排序', key: 'sales'},
                {value: '好评排序', key: 'evaluate'},
                {value: '优惠排序', key: 'discount'}
            ],
            list: [],
            other: []
        }
    },
    methods :{
        loadMore :function(){
            this.list = [].concat(this.list,this.other);
            this.other=[];
        },
        sortBy : function (type) {
            if (type === 'discount') {
                // 优惠排序，市场价 - 现价
                this.list.sort(function (a, b) {
                    var ap = a.orignPrice - a.price;
                    var bp = b.orignPrice - b.price;
                    // 得到优惠排序，就是做ap与bp的差值
                    return ap - bp;
                })
            } else {
                this.list.sort(function (a, b) {
                    // 正序
                    // return a[type] - b[type]
                    // 倒序
                    return b[type] - a[type]
                })
            }
        }
    },
    created:function () {
        this.$parent.sh = false;
        console.log(this)
        var _this = this;
        // 获取父组件中的query字段拼接url中query部分
        var query = _this.$parent.query;
        // str 保留query字段 ?type=1
        var str = '?';
        if (query[0] && query[1]) {
            str += query[0] + '=' + query[1]
        }
        Until.ajax("data/list.json"+ str, function (res) {
            _this.list = res.data.slice(0,3);
            _this.other = res.data.slice(3);
        })
    }
});
//product组件
var ProductComponent = Vue.extend({
    template: Until.tpl('tpl_product'),
    props: ['csearch',"sVla"],
    data: function () {
        return {
            data: {
                src: '01.jpg'
            }
        }
    },
    created: function () {
        // 隐藏搜索框
        this.$parent.sh = false;
        // 保存this
        var _this = this;
        // 获取数据
        Until.ajax('data/product.json', function (res) {
            if (res && res.errno === 0) {
                _this.data = res.data;
            }
        })
    }
});
//search组件
var SearchComponent = Vue.extend({
    //template :Until.tpl("tpl_home")
})


//注册组件
// 注册home组件
Vue.component("home",HomeComponent);
//注册list组件
Vue.component("list",ListComponent);
//注册product组件
Vue.component("product",ProductComponent);
//注册搜索组件
Vue.component("search",SearchComponent);

//创建vue

var app = new Vue({
    el: "#app",
    data :{
        view :"",
        searchVal :"",
        query :[],
        dealSearch : "",
        sh :""
    },
    methods :{
        goSearch :function(){
            this.dealSearch = this.searchVal;
        },
        goBack: function () {
            history.go(-1);
        },
        events: {
            'show-search': function (val) {
                this.showSearch = val;
            }
        }
    }
});

//创建路由

function router(){
    //获取hash值
    var hash = location.hash;
    //截取#号
    hash = hash.slice(1);
    //将/替换成空字符串
    hash = hash.replace(/\//,"");
    //截取/前面的字符串
    //if(hash.indexOf("/") > -1){
    //    hash = hash.slice(0,hash.indexOf("/"));
    //}
    //将hash转成数组存储
    hash = hash.split("/");
    //定义一个路由页面数组
    var map = {
        "home"    : true,
        "list"    : true,
        "product" : true
    };
    //遍历数组如果在路由数组中找到相同的字符串就将app中的view属性值设置为hash值,
    //如果没有就将app中的view属性值设置为hash值
    if(map[hash[0]]){
        app.view = hash[0];
    }else{
        app.view = "home";
    }
    app.query = hash.slice(1);
};

//为window绑定hash事件
window.addEventListener("load",router);
//监听load改变,触发hashchange事件
window.addEventListener("hashchange",router);