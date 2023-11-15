const express = require('express')
const authController = require('./../controllers/authcontroller')
const likeController = require('./../controllers/likeController')


const router = express.Router();


router.post('/:threadId',authController.protect,likeController.addLike)






module.exports = router;