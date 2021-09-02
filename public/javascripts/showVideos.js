const vid = document.getElementById("myVideo");

// 동영상이 끝나면 다음 동영상으로 넘어가기
vid.onended = function() {
    document.getElementById("gotoLINK").click();
};