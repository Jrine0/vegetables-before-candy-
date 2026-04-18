import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../server';
import { sendVerificationEmail } from '../utils/email';
import { validateUniversityEmail } from '../utils/validation';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, universityEmail, firstName, lastName, university, studentId } = req.body;

    if (!validateUniversityEmail(universityEmail, university)) {
      return res.status(400).json({ error: 'Invalid university email domain' });
    }

    const existingUser = await prisma.user.findFirst({
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

    const verificationToken = uuidv4();

    const user = await prisma.user.create({
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

    await sendVerificationEmail(universityEmail, verificationToken);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findFirst({
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

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;