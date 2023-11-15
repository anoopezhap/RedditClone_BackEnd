const express = require('express')
const authController = require('./../controllers/authcontroller')
const commentController = require('./../controllers/commentController')


const router = express.Router()


router.post('/:threadId/addComment',authController.protect,commentController.addComment)

router.post('/editComment/:commentId',authController.protect,commentController.editComment)

router.get('/getComment/:threadId',commentController.getCommentOfAThread)

module.exports = router;