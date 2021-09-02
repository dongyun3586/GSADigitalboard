var express = require('express');
var router = express.Router();
var model = require('../models/articleDAO');
const fs = require('fs/promises');
const multer = require('multer');
const { GatewayTimeout } = require('http-errors');

let fileType;

//#region 이미지 파일 처리
//파일 저장위치와 파일이름 설정
var storage = multer.diskStorage(
{
  destination: function (req, file, cb) {
    //파일이 이미지 파일이면
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
      console.log("이미지 파일이네요")
      fileType='image'
      cb(null, 'public/uploadFiles/images')
      //텍스트 파일이면
    } else if(file.mimetype=="video/mp4" || file.mimetype=="video/webm" || file.mimetype=="video/ogg"){
      console.log("동영상 파일이네요")
      fileType='video'
      cb(null, 'public/uploadFiles/videos')
    }
  },
    //파일이름 설정
    filename: function (req, file, cb) {
      const date = new Date();
    cb(null, `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${file.originalname.replace(/(\s*)/g, "")}`)
    console.log('filename', `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${file.originalname.replace(/(\s*)/g, "")}`);
  }
})

//파일 업로드 모듈
var upload = multer({ storage: storage })
//#endregion

// 이미지 게시물 요청
router.get('/show_image', async (req, res, next)=>{
  let results = await model.selectShowImage();
  if(results.length===0){
    res.send('<h1>게시물이 없습니다!!! <a href="/">Home</a><h1>')
  }else{
    //console.log('/show_image results : ', results)
    res.render('show_image', {results: results})
  }
});

// 동영상 게시물 요청
router.get('/show_video/:id', async (req, res, next)=>{
  let results = await model.selectShowVideo();
  if(results.length===0){
    res.redirect('/notice/show_image')
  }else{
    //console.log('/show_video results : ', results)
    // 현재 비디오와 다음 비디오
    videoList=[]
    let currentVideo;
    let nextVideo;
    if(results!=undefined){
      for(var i=0; i<results.length; i++){
        videoList.push(results[i].file_path)
      }
      if(req.params.id == results.length-1){
        currentVideo = `/uploadFiles/videos/${videoList[req.params.id]}`   
        nextVideo = 'http://localhost:3000/notice/show_image'        
      }else{
        currentVideo = `/uploadFiles/videos/${videoList[req.params.id]}`   
        nextVideo = `http://localhost:3000/notice/show_video/${parseInt(req.params.id)+1}` 
      }
    }
    console.log('videoList', videoList)   // videoList [ '2021-8-30-mov_bbb.mp4', '2021-8-30-movie.mp4' ]
    // console.log('videoList[req.params.id]', videoList[req.params.id])
    console.log('currentVideo', currentVideo);
    console.log('nextVideo', nextVideo)
    res.render('show_video', {currentVideo: currentVideo, nextVideo: nextVideo})
  }
})

// 새로운 게시물 작성 화면 요청
router.get('/write', function(req, res) {
  const date = new Date(); 
  today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
  console.log('today', today)
  res.render('write_notice', {today: today});
});

// 새로운 게시물 업로드 처리
router.post('/write', upload.single('file'), async (req, res)=>{
  console.log('req.body', req.body);

  let placeSum = SumCheckPlace(req.body.place);
  let imgFileName = req.file.path.substring(26);
  console.log('req.file.path', req.file.path.substring(26)) // 파일명만 남김

  // db에 저장
  try {
    await model.insertArticle(req.body, placeSum, imgFileName, 'ldy@gsa.hs.kr', fileType);
  } catch (error) {
    console.log(error);
  }
  //res.send(req.body);
  res.redirect('/');  // 이미지 목록을 보여주는 화면으로 전환되도록 한다.
})

// 업로드된 이미지 목록 화면 요청
router.get('/list', async (req, res)=>{
  let results = await model.selectArticles();
  res.render('show_notice_list', {results: results, isLogin: true, userEmail: 'ldy@gsa.hs.kr'})
})

// 게시물 삭제
router.get('/delete/:id', async (req, res)=>{
  const article = await model.selectArticleById(req.params.id);
  console.log('article : ', article);
  console.log(article[0].file_path)
  // public 폴더에서 파일 제거
  let removeFilePath='';
  if(article[0].type==='image'){
    removeFilePath=`./public/uploadFiles/images/${article[0].file_path}`;
  }else if(article[0].type==='video'){
    removeFilePath=`./public/uploadFiles/videos/${article[0].file_path}`;
  }
  try {
    await fs.unlink(removeFilePath);
    console.log(`successfully deleted ${removeFilePath}`);
    // DB에서 목록 제거
    await model.deleteArticleById(req.params.id)
  } catch (error) {
    console.error('there was an error:', error.message);
  }
  res.redirect('/notice/list')
})

// 게시물 수정 화면 요청
router.get('/modify/:id', async (req, res)=>{
  const results = await model.selectArticleById(req.params.id);
  let today = new Date(); 
  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜
  console.log(`${year}-${month}-${date}`)
  res.render('modify_notice', {results: results[0], today: `${year}-${month}-${date}`})
})


// 게시물 수청 요청 처리
router.post('/modify/:id', async (req, res)=>{
  // 장소 체크에 따른 숫자 저장 (급식실 = 1, 기숙사 = 2, 학교홍보 = 4)
  let placeSum = SumCheckPlace(req.body.place);
  
  // db에 저장
  try {
    await model.updateArticleById(req.body, placeSum, 'ldy@gsa.hs.kr', req.params.id);
  } catch (error) {
    console.log(error);
  }
  //res.send(req.body);
  res.redirect('/notice/list');  // 이미지 목록을 보여주는 화면으로 전환되도록 한다.
})

// 장소 체크에 따른 숫자 저장 (급식실 = 1, 기숙사 = 2, 학교홍보 = 4)
function SumCheckPlace(place){
  let placeSum = 0;
  if(Array.isArray(place)){
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    placeSum = place.reduce(reducer);
  }else{
    placeSum = parseInt(place); 
  }
  return placeSum
}









module.exports = router;