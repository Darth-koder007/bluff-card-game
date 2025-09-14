import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const SALT_ROUNDS = 10;

const authRouter = Router();

// /auth/register
authRouter.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        // Prisma error code for unique constraint violation
        if ((error as any).code === 'P2002') {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        console.error("Error creating user:", error);
        res.status(500).json({ error: 'Could not create user' });
    }
});

// /auth/login
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const sessionToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: sessionToken });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

export default authRouter;