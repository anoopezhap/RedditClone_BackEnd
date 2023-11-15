const { UUIDV4 } = require("sequelize")




module.exports = (sequelize,DataTypes)=>
{
    const Thread = sequelize.define('thread',{
        id:{
            type:DataTypes.UUID,
            defaultValue:UUIDV4,
            primaryKey:true
        },
        title:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        description:{
            type:DataTypes.STRING,
        },
        image:{
            type:DataTypes.STRING
        }
    },{
        paranoid:true
    })


    return Thread
}