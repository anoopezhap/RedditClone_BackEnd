const { UUIDV4 } = require("sequelize")

module.exports = (sequelize,DataTypes)=>
{
    const Like = sequelize.define('like',{
        id:{
            type:DataTypes.UUID,
            defaultValue:UUIDV4,
            primaryKey:true
        },
        userId:{
            type:DataTypes.UUID,
            allowNull:false
        },
        threadId:{
            type:DataTypes.UUID,
            allowNull:false
        }
    },
    {
        indexes:[
            {
                unique:true,
                fields:['userId','threadId']
            }
        ]
    })

    return Like
}