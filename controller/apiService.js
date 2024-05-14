require("dotenv").config();
const axios = require("axios");
var qs = require("qs");

async function SaveCoinReceived(coin_received,Qr_key){
    try{
        const post = {
            coin_received: coin_received,
            qrcodekey: Qr_key
        };
        const res = await axios.post(
            process.env.API_COIN_RECEIVED,
            qs.stringify(post),
            {
                headers: {
                    Authorization: "Bearer " + process.env.TOKEN_LETMEIN
                },
            }
        );
        console.log("==========SEND DATA===========");
        console.log(res.data);
        console.log("==============================");

        return res.data;
    }catch (error){
        console.log("============error=============");
        console.error("ERROR : ",error);
        throw error;
    }
}

module.exports = {
    SaveCoinReceived,
};
