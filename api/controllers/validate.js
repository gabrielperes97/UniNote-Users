'use strict';

exports.validate = function(req, res) {
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
}