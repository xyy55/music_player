function get_songs(url) {
    $.ajax({
        type: "get",
        url: url,
        data: "data",
        dataType: "json",
        async:false,
        success: function (response) {
            music_list = response;
        }
    });
}
function add_songs(data) {
    $.ajax({
        type: "post",
        url: "add_songs/",
        data: data,
        dataType: "json",
        async:false,
        success: function (response) {
            if(response == "304"){
                layer.msg("你已经添加过该歌曲了，请勿重复添加！")
            }else{
                layer.msg("添加成功！");
                location.reload();
            }
        }
    });
}
function search_songs(){
    var data = $(".search_info").val();
    var d = {"data":data}
    if(data == ""){
        layer.msg("请输入要搜索的歌名");
    }else{
        $.ajax({
            type: "post",
            url: "search_songs/",
            data: d,
            dataType: "json",
            async:false,
            success: function (response) {
                if(response == "304"){
                    layer.msg("没有该歌曲！")
                }else{
                    layer.msg("搜索成功！")
                    music_list = response;
                }
            }
        });
    }
    
}
function recommendation(){
    $.ajax({
        type: "post",
        url: "recommendation/",
        data: "data",
        dataType: "json",
        async:false,
        success: function (response) {
            if(response == "304"){
                layer.msg("不好意思，音乐就这么多，没什么好推荐的了！");            
            }else{
                music_list = response;
                $(".active").removeClass("active")
                $(".recommendation").addClass("active")
                refreshList();
            }
        }
    });
}
function delete_songs(data){
    $.ajax({
        type: "post",
        url: "delete_songs/",
        data: data,
        dataType: "json",
        async:false,
        success: function (response) {
            if(response == "200"){
                layer.msg("删除成功！");
                location.reload();
            }
        }
    });
}

