process.env.NODE_ENV = "test";
mongoose = require("mongoose");
User = require('../api/models/user')

chai = require("chai")
chaiHttp =  require("chai-http");
server = require("../server");
should = chai.should();
let bcrypt = require("bcrypt");
let jwt = require("jwt-simple");

chai.use(chaiHttp);

describe("Validate", () => {
    beforeEach((done) => {
        User.remove({}, (err) => {
            done();
        });
    });

    describe("/GET validate", () => {
        it("Token válido", (done) => {
            let user1 = {
                firstname: "Gabriel",
                lastname: "Peres Leopoldino",
                username: "gabrielperes",
                password: bcrypt.hashSync("H4KUN4_M4T4T4", 10),
                email: "gabriel@peres.com"
            };
            let user = new User(user1);
            user.save((err, user) => {
                let payload = {id: user._id};
                let token = jwt.encode(payload, config.jwtSecret);

                chai.request(server)
                    .get("/validate")
                    .set("authorization", token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(true);
                    done();
                    });
            });
        });

        it("Token inválido", (done) => {
            let payload = {id: user._id};
            let token = "123685954"

            chai.request(server)
                .get("/validate")
                .set("token", token)
                .end((err, res) => {
                    res.should.have.status(401);
                done();
                });
        });
    });
});