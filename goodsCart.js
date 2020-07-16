define(["jquery","jquery-cookie"],function($){
    //加载已经加入购物车的商品
    /* 
        1，cookie只存储商品id和数量
        2，加载数据，必须要使用商品的具体信息，数据源
            goodsCarList.json
            goodsList2.json
        [注]找出加入购物车的商品的数据(详情)
        new Promise处理两次按照顺序加载数据
    */
    function loadCarData(){
        //清空
        $("#J_cartListBody .item-table").html("");

        new Promise(function(resolve,reject){
            $.ajax({
                url:"../data/goodsCarList.json",
                success:function(obj){
                    resolve(obj.data);
                },
                error:function(msg){
                    reject(msg);
                }
            })
        }).then(function(arr1){
            //下载第二份
            return new Promise(function(resolve,reject){
                $.ajax({
                    url:"../data/goodsList2.json",
                    success:function(arr2){
                        //将两份数据合并
                        var newArr=arr1.concat(arr2);
                        resolve(newArr);
                    },
                    error:function(msg){
                        console.log(msg);
                    }
                })
            })
        }).then(function(arr){
            //arr 是所有商品的信息，我们需要在页面上加载购物车的数据
            //通过已经加入购物车的商品，找出，这些数据，哪些被加载购物车里了
            //1、在购物车中将所有数据拿到
            var cookieStr=$.cookie("goods");
            if(cookieStr){
                var cookieArr=JSON.parse(cookieStr);
                var newArr=[];
                for(var i=0;i<cookieArr.length;i++){
                    for(var j=0;j<arr.length;j++){
                        if(cookieArr[i].id==arr[j].product_id||cookieArr[i].id==arr[j].goodsid){
                            arr[j].num=cookieArr[i].num;
                            //设置商品的id
                            arr[j].id=arr[j].product_id?arr[j].product_id:arr[j].goodsid;
                            newArr.push(arr[j]);
                        }
                    }
                }
                // console.log(newArr);
                //newArr 存储的都是购物车中的商品信息，商品的数量，商品的id
                //通过循环，加载到页面上
                for(var i=0;i<newArr.length;i++){
                    var node=$(`<div class="item-row clearfix" id="${newArr[i].id}"> 
                            <div class="col col-check">  
                                <i class="iconfont icon-checkbox icon-checkbox-selected J_itemCheckbox" data-itemid="2192300031_0_buy" data-status="1">√</i>  
                            </div> 
                            <div class="col col-img">  
                                <a href="//item.mi.com/${newArr[i].id}.html" target="_blank"> 
                                    <img alt="" src="${newArr[i].image}" width="80" height="80"> 
                                </a>  
                            </div> 
                            <div class="col col-name">  
                                <div class="tags">   
                                </div>     
                                <div class="tags">  
                                </div>   
                                <h3 class="name">  
                                    <a href="//item.mi.com/${newArr[i].id}.html" target="_blank"> 
                                        ${newArr[i].name} 
                                    </a>  
                                </h3>        
                            </div> 
                            <div class="col col-price"> 
                                ${newArr[i].price}
                                <p class="pre-info">  </p> 
                            </div> 
                            <div class="col col-num">  
                                <div class="change-goods-num clearfix J_changeGoodsNum"> 
                                    <a href="javascript:void(0)" class="J_minus">
                                        <i class="iconfont"></i>
                                    </a> 
                                    <input tyep="text" name="2192300031_0_buy" value="${newArr[i].num}" data-num="1" data-buylimit="20" autocomplete="off" class="goods-num J_goodsNum" "=""> 
                                    <a href="javascript:void(0)" class="J_plus"><i class="iconfont"></i></a>   
                                </div>  
                            </div> 
                            <div class="col col-total"> 
                                ${newArr[i].price * newArr[i].num.toFixed(1)} 元
                                <p class="pre-info"> </p> 
                            </div> 
                            <div class="col col-action"> 
                                <a id="2192300031_0_buy" data-msg="确定删除吗？" href="javascript:void(0);" title="删除" class="del J_delGoods"><i class="iconfont"></i></a> 
                            </div> 
                        </div>`);
                        node.appendTo("#J_cartListBody .item-table");
                }
                isCheckAll();
            }
        })//因为上边return了，所以下面可以继续.then()
    }


    function download(){
        $.ajax({
            url:"../data/goodsCarList.json",
            success:function(obj){
                var arr=obj.data;
                for(var i=0;i<arr.length;i++){
                    $(`<li class="J_xm-recommend-list span4">    
                            <dl> 
                                <dt> 
                                    <a href="#"> 
                                        <img src="${arr[i].image}" srcset="//i1.mifile.cn/a1/pms_1551867177.2478190!280x280.jpg  2x" alt="小米净水器1A（厨下式）"> 
                                    </a> 
                                </dt> 
                                <dd class="xm-recommend-name"> 
                                    <a href="//item.mi.com/1181300007.html"> 
                                        ${arr[i].name} 
                                    </a> 
                                </dd> 
                                <dd class="xm-recommend-price">${arr[i].price}元</dd> 
                                <dd class="xm-recommend-tips">   ${arr[i].comments}人好评    
                                    <a class="btn btn-small btn-line-primary J_xm-recommend-btn" href="#" style="display: none;" id="${arr[i].goodsid}">加入购物车</a>  
                                </dd> 
                                <dd class="xm-recommend-notice">

                                </dd> 
                            </dl>  
                        </li>`).appendTo("#J_miRecommendBox .row");
                }
            },
            error:function(msg){
                console.log(msg);
            }
        })
    }

    function cartHover(){
        //事件委托
        $("#J_miRecommendBox .row").on("mouseenter",".J_xm-recommend-list",function(){
            $(this).find(".xm-recommend-tips a").css("display","block");
        })
        $("#J_miRecommendBox .row").on("mouseleave",".J_xm-recommend-list",function(){
            $(this).find(".xm-recommend-tips a").css("display","none");
        })

        //通过事件委托实现加入购物车操作
        $("#J_miRecommendBox .row").on("click",".xm-recommend-tips a.btn",function(){
            //获取当前的商品列表
            var id = this.id;
            //进行购物车操作   goods键，json格式字符串为值
            //1、先去判断cookie中是否存在商品信息
            var first = $.cookie("goods") == null ? true : false;
            //2、如果是第一次添加
            if(first){
                //直接创建cookie
                var cookieStr = `[{"id":${id},"num":1}]`;
                $.cookie("goods", cookieStr, {
                    expires: 7
                })
            }else{
                var same = false; //假设没有添加过
                //3、如果不是第一次添加，判断之前是否添加过
                var cookieStr = $.cookie("goods");
                var cookieArr = JSON.parse(cookieStr);
                for(var i = 0; i < cookieArr.length; i++){
                    if(cookieArr[i].id == id){
                        //如果之前添加过，数量+1
                        cookieArr[i].num++;
                        same = true;
                        break;
                    }
                }
                if(!same){
                    //如果没有添加过，新增商品数据
                    var obj = {id:id, num:1};
                    cookieArr.push(obj);
                }
                //最后，存回cookie中
                $.cookie("goods", JSON.stringify(cookieArr), {
                    expires: 7
                })
            }

            // alert($.cookie("goods"));
            isCheckAll();
            loadCarData();
            return false;
        })
    }

    //全选按钮和单选按钮添加点击
    function checkFunc(){
        //全选
        $("#J_cartBox .list-head .col-check").find("i").click(function(){
            //获取每一个单个选项框的状态
            var allChecks=$("#J_cartListBody").find(".item-row .col-check").find("i");
            if($(this).hasClass("icon-checkbox-selected")){
                $(this).add(allChecks).removeClass("icon-checkbox-selected");
            }else{
                $(this).add(allChecks).addClass("icon-checkbox-selected");
            }
            isCheckAll();
        })

        //事件委托 给每一个商品的复选框设置点击
        $("#J_cartListBody .J_cartGoods").on("click",".item-row .col-check i",function(){
            if($(this).hasClass("icon-checkbox-selected")){
                $(this).removeClass("icon-checkbox-selected");
            }else{
                $(this).addClass("icon-checkbox-selected");
            }
            isCheckAll();
        })
        
        
    }

    //判断有多少个被选中
    function isCheckAll(){
        var allChecks=$("#J_cartListBody").find(".item-row");
        var isAll=true;//假设都选中
        var total=0;//计算总价格
        var count=0;//计算被选中的数量
        var allCount=0;//记录总数
        allChecks.each(function(index,item){
            if(!$(item).find(".col-check i").hasClass("icon-checkbox-selected")){
                isAll=false;
            }else{
                total+=parseFloat($(item).find(".col-price").html().trim()) * parseFloat($(this).find(".col-num input").val());
                //被选中商品的数量
                count+=parseInt($(this).find(".col-num input").val());
            }
            allCount+=parseInt($(this).find(".col-num input").val());
        })
        //设置
        $("#J_cartTotalNum").html(allCount);
        $("#J_selTotalNum").html(count);
        $("#J_cartTotalPrice").html(total);

        if(isAll){
            $("#J_cartBox .list-head .col-check").find("i").addClass("icon-checkbox-selected");
        }else{
            $("#J_cartBox .list-head .col-check").find("i").removeClass("icon-checkbox-selected");
        }
    }

    //给页面上的商品添加删除、增加或减少的操作
    function changeCars(){
        //给每一个删除按钮添加事件
        $("#J_cartListBody .J_cartGoods").on("click",".col-action .J_delGoods",function(){
            //找到所有商品的id
            var id=$(this).closest(".item-row").remove().attr("id");
            //在cookie中也删除掉
            var cookieStr=$.cookie("goods");
            var cookieArr=JSON.parse(cookieStr);
            for(var i=0;i<cookieArr.length;i++){
                if(cookieArr[i].id==id){
                    //删除数据
                    cookieArr.splice(i,1);
                    break;
                }
            }
            cookieArr.length==0?$.cookie("goods",null):$.cookie("goods",JSON.stringify(cookieArr),{expires:7});
            isCheckAll();
            return false;
        })

        //给每一个加减按钮添加事件
        $("#J_cartListBody .J_cartGoods").on("click",".J_minus,.J_plus",function(){
            var id=$(this).closest(".item-row").attr("id");
            //在cookie中也增减
            var cookieStr=$.cookie("goods");
            var cookieArr=JSON.parse(cookieStr);
            for(var i=0;i<cookieArr.length;i++){
                if(cookieArr[i].id==id){
                    //说明找到该商品了
                    if(this.className=="J_minus"){
                        //数量减一
                        cookieArr[i].num==1?alert("数量以为1，不能再减少！"):cookieArr[i].num--;
                    }else{
                        cookieArr[i].num++;
                    }
                    break;
                }
            }

            //更新页面的商品
            $(this).siblings("input").val(cookieArr[i].num);
            //更新一下页面上单个商品的价格和总价
            var price=parseFloat($(this).closest(".col-num").siblings(".col-price").html().trim());
            $(this).closest(".col-num").siblings(".col-total").html((price*cookieArr[i].num).toFixed(1)+"元");

            //将更改后的数据存储在cookie中
            $.cookie("goods",JSON.stringify(cookieArr),{expires:7});
            isCheckAll();

            return false;
        })
    }


    return {
        download:download,
        cartHover:cartHover,
        loadCarData:loadCarData,
        checkFunc:checkFunc,
        changeCars:changeCars
    }
})
