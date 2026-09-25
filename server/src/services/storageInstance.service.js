import ImageKit from "imagekit"
import dotenv from "dotenv"
dotenv.config()
const imagekit =new ImageKit({
    publicKey :process.env.IK_PUB_KEY,
    privateKey:process.env.IK_PRI_KEY,
    urlEndpoint :process.env.IK_ENDPOINT
})


 const storageInstance = async( file, fileName)=>{

    const obj={
        file,fileName, folder:"assessment"
    }
    
    return await imagekit.upload(obj)
}

export default storageInstance