function get_songs() {
    $.ajax({
        type: "get",
        url: "get_songs/",
        data: "data",
        dataType: "json",
        async:false,
        success: function (response) {
            music_list = response;
        }
    });
}

