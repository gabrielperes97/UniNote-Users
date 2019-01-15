process.env.NODE_ENV = "test";
mongoose = require("mongoose");
User = require('../api/models/user')

chai = require("chai")
chaiHttp =  require("chai-http");
server = require("../server");
should = chai.should();
let bcrypt = require("bcrypt");

chai.use(chaiHttp);

describe("Token", () =>{

    beforeEach((done) => {
        User.remove({}, (err) => {
            done();
        });
    });

    describe("/POST token", () => {
        it("Falta algum campo", (done) => {
            let user = {
                username: "gabrielperes",
                //password: "H4KUN4_M4T4T4"
            }
            chai.request(server)
                .post("/token")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.should.have.property('message').eql("Field username and password is required");
                done();
                });
        });

        it("Senha incorreta", (done) => {
            let user1 = {
                firstname: "Gabriel",
                lastname: "Peres Leopoldino",
                username: "gabrielperes",
                password: "123321",
                email: "gabriel@peres.com"
            };
            let user2 = {
                username: "gabrielperes",
                password: "H4KUN4_M4T4T4"
            }
            let user = new User(user1);
            user.save((err, user) => {
                chai.request(server)
                    .post("/token")
                    .send(user2)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(false);
                        res.body.should.have.property("message").eql("Wrong password");
                    done();
                    });
            });
        });

        it("Usuario incorreto", (done) => {
            let user1 = {
                firstname: "Gabriel",
                lastname: "Peres Leopoldino",
                username: "gabrielperes",
                password: "H4KUN4_M4T4T4",
                email: "gabriel@peres.com"
            };
            let user2 = {
                username: "gabriel",
                password: "H4KUN4_M4T4T4"
            }
            let user = new User(user1);
            user.save((err, user) => {
                chai.request(server)
                    .post("/token")
                    .send(user2)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(false);
                        res.body.should.have.property("message").eql("Wrong username");
                    done();
                    });
            });
        });

        it("Login normal", (done) => {
            let user1 = {
                firstname: "Gabriel",
                lastname: "Peres Leopoldino",
                username: "gabrielperes",
                password: bcrypt.hashSync("H4KUN4_M4T4T4", 10),
                email: "gabriel@peres.com"
            };
            let user2 = {
                username: "gabrielperes",
                password: "H4KUN4_M4T4T4"
            }
            let user = new User(user1);
            user.save((err, user) => {
                chai.request(server)
                    .post("/token")
                    .send(user2)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(true);
                        res.body.should.have.property("message").eql("Succefully login");
                        res.body.should.have.property("token");
                    done();
                    });
            });
        });
    });
});