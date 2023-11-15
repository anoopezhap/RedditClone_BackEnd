const app = require('./app')
const db = require('./models/index')
const dotenv = require('dotenv')

dotenv.config({path:"./config.env"})




const port = 3000;



app.listen(port,async ()=>
{
    try{
        console.log(`App running on port ${port}`)
        await db.sequelize.sync({alter:true})
        console.log('table modified')
    }
    catch(err)
    {
        console.log('Something happend')
    }
})