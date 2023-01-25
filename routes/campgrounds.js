const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');


const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

const multer  = require('multer')
const {storage} = require('../cloudinary') 
const upload = multer({ storage })

const Campground = require('../models/campground');

router.route('/')
    //목록
    .get(catchAsync(campgrounds.index))
    //+오류검출 mongoose->cast->catchAsync
    //실제 환경에서는 다른 데이터 유효성 검사 전에 이미지 업로드를 하지 않을 것.
    //Multer가 파싱하는 동안은 우선 모두 업로드. (권장x)
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))


//등록
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
   
router.route('/:id')
    //찾기, 보여주기
    .get(catchAsync(campgrounds.showCampground))
    //찾고 업데이트
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //삭제
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))



//form연결, 수정
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router;