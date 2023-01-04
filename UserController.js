exports.update = async function (req, res) {
            const data = req.body
            const {
                id
            } = req.params
            // Check Form Validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({
                success: false,
                errors: errors.array()
            });
            try {
                const cek_user = await User.query().where(builder => {
                        builder.where('username', data.username).orWhere('email',
                            data.email);
                    }).where('id', '<>', id)
                    .then(onCheck => {
                        console.log('Check, is Exist in other row :', onCheck)
                        return onCheck
                    })
                    .catch(err => {
                        console.log('err', err)
                        return err
                    });
                console.log('CEK USER:', cek_user)
                // Cek Jika data ada, maka beri return Data Email dna Username sudah
                terdaftar
                if (cek_user.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username atau Email Sudah Terdaftar !',
                    })
                } else {
                    const dataUpdate = await User
                        .query()
                        .patch({
                                nama: data.nama,
                                username: data.username,
                                email: data.email,
                                telp: data.telp,
                                updated_at: moment(new Date()).format('YYYY-MM-DD HH: mm: ss ')
                                })
                            .where('id', id)
                            .returning('nama', 'username', 'email')
                            .first()
                            .then(resp => {
                                console.log('RESP:', resp)
                                res.status(200).json({
                                    success: true,
                                    message: 'Data user berhasil di Update',
                                    data: resp
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    success: false,
                                    message: 'Data user gagal di Update !'
                                })
                            });
                        }
                } catch (err) {
                    console.log(err)
                    res.status(500).json({
                        success: false,
                        message: 'Data user gagal di Update !'
                    })
                }
            }