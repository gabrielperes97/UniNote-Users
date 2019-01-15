process.env.NODE_ENV = "test";
mongoose = require("mongoose");
User = require('../api/models/user')

chai = require("chai")
chaiHttp = require("chai-http");
server = require("../server");
should = chai.should();

let bcrypt = require("bcrypt");
let jwt = require("jwt-simple");
let config = require('../configs/' + (process.env.NODE_ENV || "dev") + ".json");

chai.use(chaiHttp);

describe("Users", () => {

    //esvazia o banco a cada teste
    beforeEach((done) => {
        User.remove({}, (err) => {
            done();
        });
    });

    describe("/POST user", () => {
        it("Não deve salvar quando faltar algum campo", (done) => {
            let user = {
                firstname: "Gabriel",
                lastname: "Peres",
                username: "gabrielperes",
                //password: "123321",
                email: "gabriel@peres.com"
            }

            chai.request(server)
                .post("/user")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.should.have.property('message').eql("data and salt arguments required");
                    done();
                });
        });

        it("Deve cadastrar um usuário", (done) => {
            let user = {
                firstname: "Gabriel",
                lastname: "Peres",
                username: "gabrielperes",
                password: "123321",
                email: "gabriel@peres.com"
            }
            chai.request(server)
                .post("/user")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(true);
                    res.body.should.have.property('message').eql("User created with success");
                    done();
                });
        });

        it("Não deve haver usuários iguais", (done) => {
            let user1 = {
                firstname: "Gabriel",
                lastname: "Peres Leopoldino",
                username: "gabrielperes",
                password: "123321",
                email: "gabriel@peres.com"
            };
            let user2 = {
                firstname: "Gabriel",
                lastname: "Peres da Silva",
                username: "gabrielperes",
                password: "321321",
                email: "gabriel@silva.com"
            };
            let user = new User(user1);
            user.save((err, user) => {
                chai.request(server)
                    .post("/user")
                    .send(user2)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(false);
                        res.body.should.have.property("message").eql("This username has no available");
                        done();
                    });
            });
        });
    });

    describe("/GET user", () => {
        it("Deve recuperar dados sobre o usuário", done => {
            let user_example = {
                firstname: "Gabriel",
                lastname: "Peres",
                username: "gabrielperes",
                password: bcrypt.hashSync("123321", 10),
                email: "gabriel@peres.com",
            };
            user = new User(user_example);
            user.save((err) => {
                let payload = { id: user._id };
                let token = jwt.encode(payload, config.jwtSecret);

                chai.request(server)
                    .get("/user")
                    .set("authorization", token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(true);
                        res.body.should.have.property('firstname').eql(user_example.firstname);
                        res.body.should.have.property('lastname').eql(user_example.lastname);
                        res.body.should.have.property('username').eql(user_example.username);
                        res.body.should.have.property('email').eql(user_example.email);
                        res.body.should.have.property('_id').eql(user.id);
                        res.body.should.have.property('created_date').eql(user.created_date.toISOString());
                        res.body.should.have.property('last_update').eql(user.last_update.toISOString());

                        //Must have only the fields above
                        res.body.should.not.have.property('password');
                        res.body.should.not.have.property('notes');
                        done();
                    });
            });
        });

        it("Deve apresentar um erro caso não esteja logado", done => {
            chai.request(server)
                .get("/user")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.not.have.property('success');
                    res.body.should.not.have.property('message');
                    res.body.should.not.have.property('lastname');
                    res.body.should.not.have.property('username');
                    res.body.should.not.have.property('email');
                    res.body.should.not.have.property('_id');
                    res.body.should.not.have.property('password');
                    res.body.should.not.have.property('notes');
                    done();
                });
        });
    });

    describe("/PUT user", () => {
        it("Deve alterar apenas os campos referentes a nome, email e senha", done => {
            let user_example = {
                firstname: "Gabriel",
                lastname: "Peres",
                username: "gabrielperes",
                password: bcrypt.hashSync("123321", 10),
                email: "gabriel@peres.com",
            };
            user = new User(user_example);
            user.save((err, user) => {
                let payload = { id: user._id };
                let token = jwt.encode(payload, config.jwtSecret);

                user_example.firstname = "Paulo";
                user_example.lastname = "Silva";
                user_example.username = "paulosilva";
                user_example.password = "321123";
                user_example.email = "paulo@torres.com";

                chai.request(server)
                    .put("/user")
                    .set("authorization", token)
                    .send(user_example)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(true);
                        res.body.should.have.property('firstname').eql(user_example.firstname);
                        res.body.should.have.property('lastname').eql(user_example.lastname);
                        res.body.should.have.property('username').not.eql(user_example.username);
                        res.body.should.have.property('email').eql(user_example.email);
                        res.body.should.have.property('_id').eql(user.id);

                        User.findById(user.id).exec((err, new_user) => {
                            res.body.should.have.property('created_date').eql(new_user.created_date.toISOString());
                            res.body.should.have.property('last_update').eql(new_user.last_update.toISOString());

                            res.body.should.not.have.property('password');
                            res.body.should.not.have.property('notes');

                            bcrypt.compare(user_example.password, new_user.password, (err, hash) => {
                                hash.should.be.true;
                                done();
                            });
                            
                        });
                    });
            });
        });
    });

    describe("/DELETE user", () => {
        it("Deve excluir um usuário", done => {
            let user_example = {
                firstname: "Gabriel",
                lastname: "Peres",
                username: "gabrielperes",
                password: bcrypt.hashSync("123321", 10),
                email: "gabriel@peres.com",
            };
            user = new User(user_example);
            user.save((err, user) => {
                let payload = { id: user._id };
                let token = jwt.encode(payload, config.jwtSecret);

                chai.request(server)
                    .delete("/user")
                    .set("authorization", token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(true);
                        res.body.should.have.property('message').eql("User successfully deleted");

                        User.findById(user.id).exec((err, new_user) => {
                            should.not.exist(new_user);
                            done();
                            
                        });
                    });
            });
        });
    });
});