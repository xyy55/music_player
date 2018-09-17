var music_list = [];

$(function () {

    initProgress();     // 初始化音量条、进度条（进度条初始化要在 Audio 前，别问我为什么……）   
    initAudio();        // 初始化 audio 标签，事件绑定

    rem.mainList = $("#main-list");
    addListhead();  // 列表头
    get_songs("get_songs/");    //加载歌曲
    refreshList(); //刷新列表

    // 播放、暂停按钮的处理
    $("#music-info").click(function () {
        if (rem.playid === undefined) {
            layer.msg('请先播放歌曲');
            return false;
        }

        musicInfo(rem.playlist, rem.playid);
    });

    // 播放、暂停按钮的处理
    $(".btn-play").click(function () {
        pause();
    });

    // 循环顺序的处理
    $(".btn-order").click(function () {
        orderChange();
    });

    // 上一首歌
    $(".btn-prev").click(function () {
        prevMusic();
    });

    // 下一首
    $(".btn-next").click(function () {
        nextMusic();
    });

    // 静音按钮点击事件
    $(".btn-quiet").click(function () {
        var oldVol;     // 之前的音量值
        if ($(this).is('.btn-state-quiet')) {
            oldVol = $(this).data("volume");
            oldVol = oldVol ? oldVol : (rem.isMobile ? 1 : 0.6);  // 没找到记录的音量，则重置为默认音量
            $(this).removeClass("btn-state-quiet");     // 取消静音
        } else {
            oldVol = volume_bar.percent;
            $(this).addClass("btn-state-quiet");        // 开启静音
            $(this).data("volume", oldVol); // 记录当前音量值
            oldVol = 0;
        }
        playerSavedata('volume', oldVol); // 存储音量信息
        volume_bar.goto(oldVol);    // 刷新音量显示
        if (rem.audio[0] !== undefined) rem.audio[0].volume = oldVol;  // 应用音量
    });

});

// 播放器本地存储信息
// 参数：键值、数据
function playerSavedata(key, data) {
    key = 'mkPlayer2_' + key;    // 添加前缀，防止串用
    data = JSON.stringify(data);
    // 存储，IE6~7 不支持HTML5本地存储
    if (window.localStorage) {
        localStorage.setItem(key, data);
    }
}

// 播放器读取本地存储信息
// 参数：键值
// 返回：数据
function playerReaddata(key) {
    if (!window.localStorage) return '';
    key = 'mkPlayer2_' + key;
    return JSON.parse(localStorage.getItem(key));
}

// 改变右侧封面图像
// 新的图像地址
function changeCover(img) {
    $("#music-cover").attr("src", img);
}

//点击登录按钮
$(".lg").click(
    function () {
        window.location.href = "/sign"
    }
);
//点击退出按钮
$(".lgo").click(
    function () {
        window.location.href = "/logout"
    }
);
// 向列表中加入列表头
function addListhead() {
    var html = '<div class="list-item list-head">' +
        '    <span class="auth-name">' +
        '        歌手' +
        '    </span>' +
        '    <span class="music-name">' +
        '        歌曲' +
        '    </span>' +
        '</div>';
    rem.mainList.append(html);
}
// 列表中新增一项
// 参数：编号、名字、歌手
function addItem(no, name, auth, s_uuid) {
    var html = '<div class="list-item lst" data-no="' + (no - 1) + '"data-uuid="'+s_uuid+'">' +
        '    <span class="list-num">' + no + '</span>' +
        '    <span class="auth-name">' + auth + '</span>' +
        '    <span class="music-name">' + name + '</span>' +
        '</div>';
    rem.mainList.append(html);
}
// 列表鼠标移过显示对应的操作按钮
$(".music-list").on("mousemove", ".list-item", function () {
    var num = parseInt($(this).data("no"));
    if (isNaN(num)) return false;
    // 还没有追加菜单则加上菜单
    if (!$(this).data("loadmenu")) {
        if($(".active").hasClass("my-list")){
            var target = $(this).find(".music-name");
            var html = '<span class="music-name-cult">' +
                target.html() +
                '</span>' +
                '<div class="list-menu" data-no="' + num + '">' +
                '<span class="list-icon icon-play" data-function="play" title="点击播放这首歌"></span>' +
                '<span class="list-icon icon-download" data-function="download" title="点击下载这首歌"></span>' +
                '<span class="list-icon icon-delete" data-function="delete" title="点击从歌单删除"></span>' +
                '</div>';
            target.html(html);
            $(this).data("loadmenu", true);
        }else{
            var target = $(this).find(".music-name");
            var html = '<span class="music-name-cult">' +
                target.html() +
                '</span>' +
                '<div class="list-menu" data-no="' + num + '">' +
                '<span class="list-icon icon-play" data-function="play" title="点击播放这首歌"></span>' +
                '<span class="list-icon icon-download" data-function="download" title="点击下载这首歌"></span>' +
                '<span class="list-icon icon-add" data-function="add" title="点击添加到歌单"></span>' +
                '</div>';
            target.html(html);
            $(this).data("loadmenu", true);
        }
        
    }
});
// 列表中的菜单点击
$(".music-list").on("click", ".icon-play,.icon-download,.icon-add,.icon-delete", function () {
    var num = parseInt($(this).parent().data("no"));
    var uuid = $(this).parent().parent().parent().data("uuid")
    if (isNaN(num)) return false;
    switch ($(this).data("function")) {
        case "play":    // 播放
            $(".list-playing").removeClass("list-playing");
            rem.id = num;
            playList();     // 调用列表点击处理函数
            play();
            break;
        case "download":    // 下载
            rem.id = num;
            playList();
            window.open(rem.playlink);
            break;
        case "add":   // 添加到歌单
            var ticket = getCookie("ticket");
            if (ticket == "") {
                layer.msg("请先登录");
            } else {
                layer.confirm("确定要添加到歌单吗？", {
                    btn: ['是的', '没有']
                  },function(){
                    var data = { "uuid": uuid }
                    add_songs(data);
                  });
            }
            break;
        case "delete":  //从歌单删除
            layer.confirm("确定要从歌单删除吗？", {
                btn: ['是的', '没有']
            },function(){
                var data = { "uuid": uuid }
                delete_songs(data);
            });
            break;
    }
    return true;
});
// 刷新当前显示的列表，如果有正在播放则添加样式
function refreshList() {
    $(".lst").remove();
    for (let i = 0; i < music_list.length; i++) {
        addItem(i + 1, music_list[i].s_name, music_list[i].s_author,music_list[i].s_uuid)
    }
}
//获取浏览器cookies
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}
// 歌单点击事件
$(".play-list").click(function () {
    $(".active").removeClass("active")
    get_songs("get_songs/");    //加载歌曲
    refreshList(); //刷新列表
    $(this).addClass("active")
});
$(".my-list").click(function () {
    $(".active").removeClass("active")
    $(this).addClass("active")
    var ticket = getCookie("ticket");
    if (ticket == "") {
        layer.msg("请先登录");
    } else {
        get_songs("get_my_songs/");
        refreshList();
    }
});
$(".recommendation").click(function () {
    var ticket = getCookie("ticket");
    if (ticket == "") {
        layer.msg("请先登录");
    } else {
        recommendation();
    }
});
$(".search").click(function(){
    $(".active").removeClass("active")
    search_songs();
    refreshList();
})