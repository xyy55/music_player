// 正在播放的音乐
var rem = [];

// 播放
function audioPlay() {
    rem.paused = false;     // 更新状态（未暂停）
    $(".btn-play").addClass("btn-state-paused");        // 恢复暂停

    $("#music-progress .mkpgb-dot").addClass("dot-move");   // 小点闪烁效果

    var msg = " 正在播放: " + rem.songname  // 改变浏览器标题

    // 清除定时器
    if (rem.titflash !== undefined) {
        clearInterval(rem.titflash);
    }
    // 标题滚动
    titleFlash(msg);
}
// 标题滚动
function titleFlash(msg) {

    // 截取字符
    var tit = function () {
        msg = msg.substring(1, msg.length) + msg.substring(0, 1);
        document.title = msg;
    };
    // 设置定时间 300ms滚动
    rem.titflash = setInterval(function () { tit() }, 300);
}
// 暂停
function audioPause() {
    rem.paused = true;      // 更新状态（已暂停）

    $(".list-playing").removeClass("list-playing");        // 移除其它的正在播放

    $(".btn-play").removeClass("btn-state-paused");     // 取消暂停

    $("#music-progress .dot-move").removeClass("dot-move");   // 小点闪烁效果

    // 清除定时器
    if (rem.titflash !== undefined) {
        clearInterval(rem.titflash);
    }
    document.title = 'Music';    // 改变浏览器标题
}

//播放
function play() {
    try {
        rem.audio[0].pause();
        rem.audio.attr('src', rem.playlink);
        rem.audio[0].play();
    } catch (e) {
        audioErr(); // 调用错误处理函数
        return;
    }
    music_bar.goto(0);  // 进度条强制归零
    music_bar.lock(false);  // 取消进度条锁定
    changeCover(rem.img_url);    // 更新封面展示
    lyricCallback(rem.lrc);      //加载歌词
    $(".list-item[data-no='" + rem.id + "']").addClass("list-playing");  // 添加正在播放样式
}

// 点击暂停按钮的事件
function pause() {
    if (rem.paused === false) {  // 之前是播放状态
        rem.audio[0].pause();  // 暂停
    } else {
        if (rem.playlink === undefined) {
            rem.id = 0
            playList();
            play();
        }
        $(".list-item[data-no='" + rem.id + "']").addClass("list-playing");  // 添加正在播放样式
        rem.audio[0].play();
    }
}
// 歌曲时间变动回调函数
function updateProgress() {
    // 暂停状态不管
    if (rem.paused !== false) return true;
    // 同步进度条
    music_bar.goto(rem.audio[0].currentTime / rem.audio[0].duration);
    // 同步歌词显示	
    scrollLyric(rem.audio[0].currentTime);

}

// 初始化 Audio
function initAudio() {
    rem.audio = $('<audio></audio>').appendTo('body');
    // 应用初始音量
    rem.audio[0].volume = volume_bar.percent;
    rem.audio[0].addEventListener('timeupdate', updateProgress);   // 更新进度
    rem.audio[0].addEventListener('play', audioPlay);  // 开始播放了
    rem.audio[0].addEventListener('pause', audioPause);   // 暂停
    $(rem.audio[0]).on('ended', nextMusic);   // 播放结束

}

// 音量条变动回调函数
// 参数：新的值
function vBcallback(newVal) {
    if (rem.audio[0] !== undefined) {   // 音频对象已加载则立即改变音量
        rem.audio[0].volume = newVal;
    }

    if ($(".btn-quiet").is('.btn-state-quiet')) {
        $(".btn-quiet").removeClass("btn-state-quiet");     // 取消静音
    }

    if (newVal === 0) $(".btn-quiet").addClass("btn-state-quiet");

    playerSavedata('volume', newVal); // 存储音量信息
}

// 音乐进度条拖动回调函数
function mBcallback(newVal) {
    var newTime = rem.audio[0].duration * newVal;
    // 应用新的进度
    rem.audio[0].currentTime = newTime;
    refreshLyric(newTime);  // 强制滚动歌词到当前进度
}

// 下面是进度条处理
var initProgress = function () {
    // 初始化播放进度条
    music_bar = new mkpgb("#music-progress", 0, mBcallback);
    music_bar.lock(true);   // 未播放时锁定不让拖动
    // 初始化音量设定
    var tmp_vol = playerReaddata('volume');
    tmp_vol = (tmp_vol != null) ? tmp_vol : (rem.isMobile ? 1 : 0.6);
    if (tmp_vol < 0) tmp_vol = 0;    // 范围限定
    if (tmp_vol > 1) tmp_vol = 1;
    if (tmp_vol == 0) $(".btn-quiet").addClass("btn-state-quiet"); // 添加静音样式
    volume_bar = new mkpgb("#volume-progress", tmp_vol, vBcallback);
};

// mk进度条插件
// 进度条框 id，初始量，回调函数
mkpgb = function (bar, percent, callback) {
    this.bar = bar;
    this.percent = percent;
    this.callback = callback;
    this.locked = false;
    this.init();
};

mkpgb.prototype = {
    // 进度条初始化
    init: function () {
        var mk = this, mdown = false;
        // 加载进度条html元素
        $(mk.bar).html('<div class="mkpgb-bar"></div><div class="mkpgb-cur"></div><div class="mkpgb-dot"></div>');
        // 获取偏移量
        mk.minLength = $(mk.bar).offset().left;
        mk.maxLength = $(mk.bar).width() + mk.minLength;
        // 窗口大小改变偏移量重置
        $(window).resize(function () {
            mk.minLength = $(mk.bar).offset().left;
            mk.maxLength = $(mk.bar).width() + mk.minLength;
        });
        // 监听小点的鼠标按下事件
        $(mk.bar + " .mkpgb-dot").mousedown(function (e) {
            e.preventDefault();    // 取消原有事件的默认动作
        });
        // 监听进度条整体的鼠标按下事件
        $(mk.bar).mousedown(function (e) {
            if (!mk.locked) mdown = true;
            barMove(e);
        });
        // 监听鼠标移动事件，用于拖动
        $("html").mousemove(function (e) {
            barMove(e);
        });
        // 监听鼠标弹起事件，用于释放拖动
        $("html").mouseup(function (e) {

            mdown = false;
        });

        function barMove(e) {
            if (!mdown) return;
            var percent = 0;
            if (e.clientX < mk.minLength) {
                percent = 0;
            } else if (e.clientX > mk.maxLength) {
                percent = 1;
            } else {
                percent = (e.clientX - mk.minLength) / (mk.maxLength - mk.minLength);
            }
            mk.callback(percent);
            mk.goto(percent);
            return true;
        }

        mk.goto(mk.percent);

        return true;
    },
    // 跳转至某处
    goto: function (percent) {
        if (percent > 1) percent = 1;
        if (percent < 0) percent = 0;
        this.percent = percent;
        $(this.bar + " .mkpgb-dot").css("left", (percent * 100) + "%");
        $(this.bar + " .mkpgb-cur").css("width", (percent * 100) + "%");
        return true;
    },
    // 锁定进度条
    lock: function (islock) {
        if (islock) {
            this.locked = true;
            $(this.bar).addClass("mkpgb-locked");
        } else {
            this.locked = false;
            $(this.bar).removeClass("mkpgb-locked");
        }
        return true;
    }
};
// 播放正在播放列表中的歌曲
function playList() {
    rem.playlink = "media/" + music_list[rem.id].mp3;
    rem.img_url = "media/" + music_list[rem.id].image;
    rem.songname = music_list[rem.id].s_name;
    rem.lrc = music_list[rem.id].lrc;
}
// 播放下一首歌
function nextMusic() {
    $(".list-playing").removeClass("list-playing");        // 移除其它的正在播放
    if (rem.order == 3){
        var id = parseInt(Math.random() * music_list.length);
        while(id == rem.id){
            id = parseInt(Math.random() * music_list.length);
        }
        rem.id = id;
        playList();
        play();
    }else if(rem.order == 1){
        play();
    }else{
        if (rem.id < music_list.length - 1) {
            rem.id++;
            playList();
            play();
        }else{
            rem.id = 0;
            playList();
            play();
        }
    }
}
//播放上一首歌
function prevMusic() {
    $(".list-playing").removeClass("list-playing");        // 移除其它的正在播放
    if (rem.order == 3){
        var id = parseInt(Math.random() * music_list.length);
        while(id == rem.id){
            id = parseInt(Math.random() * music_list.length);
        }
        rem.id = id;
        playList();
        play();
    }else if(rem.order == 1){
        play();
    }else{
        if (rem.id > 0) {
            rem.id--;
            playList();
            play();
        }else{
            rem.id = music_list.length-1;
            playList();
            play();
        }
    }
}
// 循环顺序
function orderChange() {
    var orderDiv = $(".btn-order");
    orderDiv.removeClass();
    switch(rem.order) {
        case 1:     // 单曲循环 -> 列表循环
            orderDiv.addClass("player-btn btn-order btn-order-list");
            layer.msg("列表循环");
            rem.order = 2;
            break;
            
        case 3:     // 随机播放 -> 单曲循环
            orderDiv.addClass("player-btn btn-order btn-order-single");
            layer.msg("单曲循环");
            rem.order = 1;
            break;
            
        // case 2:
        default:    // 列表循环(其它) -> 随机播放
            orderDiv.addClass("player-btn btn-order btn-order-random");
            layer.msg("随机播放");
            rem.order = 3;
    }
}