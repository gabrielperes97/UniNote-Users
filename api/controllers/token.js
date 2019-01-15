'use strict';

let mongoose = require('mongoose');
let User = mongoose.model('Users');
let bcrypt = require("bcrypt");
let config = require('../../configs/'+ (process.env.NODE_ENV || "dev") + ".json");
var jwt = require("jwt-simple");


exports.login = function(req, res) {
    if(req.body.username && req.body.password) {
        User.findOne({username: req.body.username})
            .then(user => {
                if (user){
                    bcrypt.compare(req.body.password, user.password, (err, hash) => {
                        if (hash)
                        {
                            let payload = {id: user._id};
                            let token = jwt.encode(payload, config.jwtSecret);
                            res.json({success: true, message: "Succefully login", token: token}); //TODO mudar essa mensagem tosca, mudar tb no teste
                        }
                        else
                        {
                            res.json({success: false, message: "Wrong password"});
                        }
                    })
                    
                }
                else
                    res.json({success: false, message: "Wrong username"});
            })
    }else{
        res.json({success: false, message: "Field username and password is required"});
    }
};