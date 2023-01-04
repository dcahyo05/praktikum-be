var User = require("../models/User");
const knex = require("../../db/knex");
const bcrypt = require("bcrypt");
const {
    useLimitInFirst,
    query
} = require("../models/User");
const {
    validationResult
} = require('express-validator');
const jwt = require('jsonwebtoken');

exports.get = async function (req, res) {
    res.status(200).json({
        success: true,
        message: "Endpoint GET User",
    });
};
exports.getById = async function (req, res) {
    const {
        id
    } = req.params;
    res.status(200).json({
        success: true,
        message: "Endpoint GET User By Id",
        id: id,
    });
};

exports.update = async function (req, res) {
    /* #swagger.tags = ['User']
#swagger.description = 'Endpoint untuk mengUpdate Data User' */
    /* #swagger.parameters['body'] = {
    name: 'user',
    in: 'body',
    description: 'User information.',
    required: true,
    schema: { $ref: '#/definitions/UserRequestFormat' }
    } */
    /* #swagger.security = [{
    "apiKeyAuth": []
    }] */
    const {
        id
    } = req.params;
    res.status(200).json({
        success: true,
        message: "Endpoint Update User",
        id: id,
    });
};
exports.delete = async function (req, res) {
    const {
        id
    } = req.params;
    res.status(200).json({
        success: true,
        message: "Endpoint Delete User",
        id: id,
    });
};

exports.get = async function (req, res) {
    try {
        let users = await User.query();
        if (users.length > 0) {
            res.status(200).json({
                success: true,
                data: users,
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Data tidak detmukan!",
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.create = async function (req, res) {
    /* #swagger.tags = ['User']
#swagger.description = 'Endpoint to createUser' */
    /* #swagger.parameters['body'] = {
    name: 'user',
    in: 'body',
    description: 'User information.',
    required: true,
    schema: { $ref: '#/definitions/UserRequestFormat' }
    } */
    /* #swagger.security = [{
    "apiKeyAuth": []
    }] */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({
        success: false,
        errors: errors.array()
    });

    try {
        const data = req.body;
        const hassPass = bcrypt.hashSync(data.password, 10);
        await User.query()
            .insert({
                nama: data.nama,
                username: data.username,
                telp: data.telp,
                email: data.email,
                password: bcrypt.hashSync(data.password, 10),
            })
            .returning(["id", "nama", "username", "email", "telp"])
            .then(async (users) => {
                res.status(200).json({
                    success: true,
                    message: "Anda Berhasil Terdaftar di Sistem Praktikum! ",
                    data: {
                        nama: users.nama,
                        username: users.username,
                        email: users.email,
                        telp: users.telp,
                    },
                });
            })
            .catch((error) => {
                console.log("ERR:", error);
                res.json({
                    success: false,
                    message: `Registrasi Gagal, ${error.nativeError.detail} `,
                });
            });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Registrasi Gagal, Internal server error !",
        });
    }
};

//Login
exports.login = async function (req, res, next) {
    /* #swagger. tags =['User']
    #swagger.description = 'Endpoint to login' */

    /* #swagger.paramaters['body'] = {
        nama : 'login',
        in : 'body',
        description : 'Data Login.',
        requered : true,
        schema : { $ref : '#/definitions/LoginRequestFormat' }
    }

    /* #swagger.security = [{
        "ApiKeyAuth" : []
     }] */

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({
        success: false,
        errors: errors.array()
    });
    try {
        const data = req.body;
        const identity = data.identity;
        const password = data.password;
        const cek_user = await User.query().where(builder => {
            builder.where('username', identity).orWhere('email', identity);
        });
        // Akan menghasilkan query yg sama seperti select * from users where (username = 'identity'email = 'identity')
        console.log('USER:', cek_user.length)
        if (cek_user.length > 0) {
            const data_user = cek_user[0]
            bcrypt.compare(password, data_user.password)
                .then(async isAuthenticated => {
                    if (!isAuthenticated) {
                        res.json({
                            success: false,
                            message: "Password yang Anda masukkan, salah !",
                        });
                    } else {
                        const data_jwt = {
                            username: data_user.username,
                            email: data_user.email
                        }
                        const jwt_token = jwt.sign(data_jwt, process.env.API_SECRET, {
                            expiresIn: "10m"
                        });
                        res.status(200).json({
                            success: true,
                            data: data_jwt,
                            jwt_token
                        })
                    }
                })
        } else {
            res.status(400).json({
                success: false,
                message: "Username atau Email tidak terdaftar !",
            });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}