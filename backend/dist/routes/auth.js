"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const server_1 = require("../server");
const email_1 = require("../utils/email");
const validation_1 = require("../utils/validation");
const router = express_1.default.Router();
router.post('/register', async (req, res) => {
    try {
        const { email, universityEmail, firstName, lastName, university, studentId } = req.body;
        if (!(0, validation_1.validateUniversityEmail)(universityEmail, university)) {
            return res.status(400).json({ error: 'Invalid university email domain' });
        }
        const existingUser = await server_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { universityEmail }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const verificationToken = (0, uuid_1.v4)();
        const user = await server_1.prisma.user.create({
            data: {
                email,
                universityEmail,
                firstName,
                lastName,
                university,
                studentId,
                emailVerificationToken: verificationToken
            }
        });
        await (0, email_1.sendVerificationEmail)(universityEmail, verificationToken);
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.status(201).json({
            message: 'Registration successful. Please verify your university email.',
            token,
            user: {
                id: user.id,
                email: user.email,
                universityEmail: user.universityEmail,
                firstName: user.firstName,
                lastName: user.lastName,
                university: user.university,
                emailVerified: user.emailVerified
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        const user = await server_1.prisma.user.findFirst({
            where: { emailVerificationToken: token }
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }
        await server_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null
            }
        });
        res.json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await server_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { universityEmail: email }
                ]
            }
        });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                universityEmail: user.universityEmail,
                firstName: user.firstName,
                lastName: user.lastName,
                university: user.university,
                emailVerified: user.emailVerified,
                walletAddress: user.walletAddress
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
exports.default = router;
