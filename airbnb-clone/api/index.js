const cors = require("cors");
const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
app.use(express.json());
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

const secretKey = bcrypt.genSaltSync(8);

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser())

mongoose.connect("mongodb://localhost:27017/Todo");

app.get("/test", (req, res) => {
  res.json("test ok");
});
app.post("/register",async(req, res) => {
  const { name, email, password } = req.body;
  try{
    const usernew = await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, secretKey),
      });
      usernew.save()
    
      res.json({ usernew});
  }
  catch(e){
    res.status(422).json(e)
  }
});

app.post('/login',async(req,res)=>{
    const{email,password}=req.body
    const userDoc = await User.findOne({email})
    if(userDoc){
        const passOk=bcrypt.compareSync(password,userDoc.password)
        if(passOk){
            jwt.sign({email:userDoc.email,id:userDoc._id},'jwtSecretKey',{},(err,token)=>{
                if(err) throw err;
                res.cookie('token',token).json(userDoc)
            })
        }
        else{
            res.status(422).json('Incorrect password')
        }
    }else{
        res.status(422).json('user not found')
    }
})

// app.get('/profile',(req,res)=>{
//     const {token}=req.cookies;
//     if(token){
//         jwt.verify(token,'jwtSecretKey',{},(err,user)=>{
//             if(err) throw err
//             res.json(user)
//         })
//     }
//     else{
//         res.json(null)
//     }
// })


app.listen(3001, () => {
  console.log("Server running successfully");
});
