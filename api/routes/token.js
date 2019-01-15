'use strict';

module.exports = function(app) {
    var token = require('../controllers/token');

    app.route('/token')
        .post(token.login);
    
};