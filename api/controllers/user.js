'use strict';

let mongoose = require('mongoose');
let User = mongoose.model('Users');
let bcrypt = require("bcrypt");

exports.create_a_user = function(req, res) {
    User.findOne({"username": req.body.username})
        .then(user => {
            if(user) {
                res.json({ success: false, message: "This username has no available"});
            }
            else{
                bcrypt.hash(req.body.password, 10)
                    .then(hash => {
                        let new_user = new User({
                            username: req.body.username,
                            email: req.body.email, 
                            password: hash,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            isAdmin: false //WARNING: Caso altere aqui, lembre-se que essa linha garante que ninguem irá se registrar como admin
                        });

                        new_user.save()
                            .then(() => res.json({ success: true, message: "User created with success" }))
                            .catch(err => res.json({ success: false, message: err.message }));
                    })
                    .catch(err => res.json({ success: false, message: err.message }));
            }
        });
};

exports.read_a_user = function(req, res) {
    let ret = {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        username: req.user.username,
        email: req.user.email,
        _id: req.user.id,
        created_date: req.user.created_date,
        last_update: req.user.last_update,
        success: true
    };
    res.json(ret);
};

exports.update_a_user = function (req, res) {
    var updated = false;
    if (req.body.firstname)
    {
        req.user.firstname = req.body.firstname;
        updated = true;
    }
    if (req.body.lastname)
    {
        req.user.lastname = req.body.lastname;
        updated = true;
    }
    if (req.body.email)
    {
        req.user.email = req.body.email;
        updated = true;
    }
    if (req.body.password)
    {
        req.user.password = bcrypt.hashSync(req.body.password, 10);
        updated = true;
    }
    
    if (updated)
    {
        req.user.save((err, user) => {
            if(err)
                res.json({success: false, message: err});
            else
            {
                let ret = {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    username: user.username,
                    email: user.email,
                    _id: user.id,
                    created_date: user.created_date,
                    last_update: user.last_update,
                    success: true
                };
                res.json(ret);
            }
        });
    }
    else
    {
        res.json({success: false, message: "Don't have a valid field to update"});
    }
};

exports.delete_a_user = function(req, res) {
    req.user.remove(err => {
        if (err)
            res.json({success: false, message: err});
        else
            res.json({success: true, message: 'User successfully deleted'});
    });
};
