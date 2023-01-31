const express = require("express");
const cors = require("cors");
require("./db/config");
const users = require("./db/users");
const product = require("./db/product");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
  try {
    let user = new users(req.body);
    let data = await user.save();
    if (data) {
      const userInfo = data.toObject();
      delete userInfo.password;
      delete userInfo.confpassword;
      let token = jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            userInfo
          },
          "secret"
        );
      res.status(201).json({ message: "Registration Successful", userInfo,token });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    } else {
      return res.status(500).json({ message: err.message });
    }
  }
});

app.post("/login", async (req, res) => {
  try {
    let { password, email } = req.body;
    if (password && email) {
      let data = await users
        .findOne(req.body)
        .select("-password -confpassword");
      if (data) {
        let token = jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            data
          },
          "secret"
        );
        res.status(200).json({ data,token });
      } else {
        return res
          .status(401)
          .json({ message: "Email or password is invalid" });
      }
    } else {
      return res
        .status(422)
        .json({ message: "Email and password is required" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
app.post("/add-product",verifyToken, async (req, res) => {
  try {
    let { name, price, category, company } = req.body.form;
    let { userId } = req.body;
    let prod = new product({ userId, name, price, category, company });
    let result = await prod.save();
    res.status(201).json({ message: "data created", result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/list-products/:userId",verifyToken, async (req, res) => {
  try {
    let listofprod = await product.find({userId:req.params.userId});
    if (listofprod) {
      return res.status(200).json({ data: listofprod });
    } else {
      return res.status(400).json({ message: "No product found" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.delete("/product/:id",verifyToken, async (req, res) => {
  let result = await product.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/product/:id",verifyToken, async (req, res) => {
  try {
    let result = await product.findOne({ _id: req.params.id });
    if (result) {
      res.status(200).json({ result });
    } else {
      res.status(400).json({ meassage: "No product Found" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.put("/product/:id",verifyToken, async (req, res) => {
  try {
    let { name, price, category, company } = req.body;
    let data = await product.updateOne(
      { _id: req.params.id },
      { $set: { name, price, category, company } }
    );
    if (data) {
      res.status(200).json({ data });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/search/:userId/:key",verifyToken, async (req, res) => {
  try {
    let userid=req.params.userId
    let key = `^${req.params.key}`;
    let result = await product.find({userId:userid,
      $or: [
        { name: { $regex: key, $options: "i" } },
        { category: { $regex: key, $options: "i" } },
      ],
    });
    if (result) {
      res.status(200).json({ result });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

function verifyToken(req,res,next){
    let token= req.headers.authorization;
    if(token)
    {
      jwt.verify(token,'secret',(err,decoded)=>{
         if(err){
            return res.status(400).json({message:"Token is not valid"})
         }
         else{
            next()
         }
      })     
    }
    else
    {
        return res.status(400).json({message:'Token is missing'})
    }

}
app.listen(4000);
