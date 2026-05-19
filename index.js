const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN;

const GUILD_ID = "1506261282347552812";
const ROLE_ID = "1506261475373748256";

const REDIRECT_URI =
process.env.REDIRECT_URI;

// ========================
// Discord OAuth Callback
// ========================

app.get("/callback", async (req, res) => {

const code = req.query.code;

if(!code){
return res.send("コードなし");
}

try{

// ========================
// Access Token取得
// ========================

const tokenRes = await axios.post(
"https://discord.com/api/oauth2/token",

new URLSearchParams({
client_id: CLIENT_ID,
client_secret: CLIENT_SECRET,
grant_type: "authorization_code",
code: code,
redirect_uri: REDIRECT_URI,
scope: "identify guilds.join"
}),

{
headers:{
"Content-Type":
"application/x-www-form-urlencoded"
}
}
);

const access_token =
tokenRes.data.access_token;

// ========================
// ユーザー取得
// ========================

const userRes = await axios.get(
"https://discord.com/api/users/@me",

{
headers:{
Authorization:
`Bearer ${access_token}`
}
}
);

const user = userRes.data;

// ========================
// サーバー参加
// ========================

await axios.put(
`https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}`,

{
access_token: access_token
},

{
headers:{
Authorization:
`Bot ${BOT_TOKEN}`,
"Content-Type":
"application/json"
}
}
);

// ========================
// ロール付与
// ========================

await axios.put(
`https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}/roles/${ROLE_ID}`,

{},

{
headers:{
Authorization:
`Bot ${BOT_TOKEN}`
}
}
);

res.send(`
<h1>認証成功</h1>
<p>${user.username} さんにロール付与しました</p>
`);

}catch(err){

console.error(err.response?.data || err);

res.send("認証失敗");

}

});

// ========================
// 起動
// ========================

app.listen(3000, () => {

console.log("BOT起動");

});