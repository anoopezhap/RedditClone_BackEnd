const AppError = require('./../utils/appError')


module.exports = (err,req,res,next)=>{



    // if(err.errors[0].message==="likes_user_id_thread_id must be unique")
    // {
    //    res.status(400).json({
    //     status:'error',
    //     message:'you already liked the post'
    //    }) 

    // }

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack
    })
}