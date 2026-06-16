const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.json({
        message:"COMP6841 CTF"
    });
});

app.listen(3000);