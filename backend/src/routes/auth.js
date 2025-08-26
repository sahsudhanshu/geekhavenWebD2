import { Router } from "express";
import { User } from "../models/index.js";
import generateToken from './../utils/tokenGenerator.js'

const registerUser = Router()
registerUser.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userCheck = await User.findOne({ email: email })

        if (userCheck) {
            return res.status(400).json({ message: "User Already Exists!" })
        }

        const user = await User.create({ name, email, password });

        if (user) {
            return res.status(201).json({
                message: 'User registered successfully',
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Server Error!' })
    }
})


const loginUser = Router()
loginUser.post('/', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
})

export { loginUser, registerUser };