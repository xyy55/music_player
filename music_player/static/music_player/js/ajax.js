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
                layer.msg("添加成功！")
            }
        }
    });
}

