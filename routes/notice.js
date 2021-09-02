var express = require('express');
var router = express.Router();
var model = require('../models/articleDAO');
var fs = require('fs')
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
  //console.log('/show_image results : ', results)
  res.render('show_image', {results: results})
});

// 동영상 게시물 요청
router.get('/show_video/:id', async (req, res, next)=>{
  let results = await model.selectShowVideo();
  console.log('/show_video results : ', results)
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

  // 장소 체크에 따른 숫자 저장 (급식실 = 1, 기숙사 = 2, 학교홍보 = 4)
  let placeSum = 0;
  if(Array.isArray(req.body.place)){
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    placeSum = req.body.place.reduce(reducer);
  }else{
    placeSum = parseInt(req.body.place); 
  }
  console.log('placeSum', placeSum);
  
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

// 업로드된 이미지 목록에서 이미지 정보 수정


// 업로드된 이미지 목록에서 이미지 삭제











module.exports = router;