'use strict';

module.exports = function(app) {
    var users = require('../controllers/user');

    app.route('/user')
        .post(users.create_a_user) //Create
        .put(auth.authenticate(), users.update_a_user)
        .get(auth.authenticate(), users.read_a_user)
        .delete(auth.authenticate(), users.delete_a_user);
};