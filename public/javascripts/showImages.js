var obj = document.getElementsByName("showImage");
console.log('showImage ', obj.length);      // 게시된 이미지 수

// O초마다 차례 대로 스크롤하며 보여주기
window.onload = ()=>{
    let img_length = obj.length;
    let numberOfIterations = 1;
    const showInterval = 3000;
    const sectionList = []
    for (let i = 0; i < img_length; i++) {
        sectionList.push('#img'+i);             // const sectionList = ['#img0', '#img1', '#img2']
    }
    // console.log('sectionList', sectionList);

    let index = 0;
    let target;
    let count = img_length * numberOfIterations;     // 게시되는 이미지 수 * 반복 횟수

    setInterval(() => {
        target = $(sectionList[index++]);
        console.log('target = ', target);  // target S.fn.init [section#img0.page-section]
        $('html, body').animate(
        {
            scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        index %= sectionList.length;    

        console.log('count = ', count--);                                    
        if(count < 0){
            window.location.href = "http://localhost:3000/notice/show_video/0"; // 특정 url 요청
        }
    }, showInterval);
}