'use strict';

module.exports = function(app) {
    var validate = require('../controllers/validate');

    app.route('/validate')
        .get(auth.authenticate(), validate.validate);
    
};