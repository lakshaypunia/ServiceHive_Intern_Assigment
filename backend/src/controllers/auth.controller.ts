import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.parse(req.body);

    const exists = await User.findOne({ email: parsed.email.toLowerCase() });
    if (exists) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const user = await User.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      password: parsed.password,
      role: parsed.role ?? 'sales_user',
    });

    const token = signToken({ _id: user._id.toString(), email: user.email, role: user.role });

    sendSuccess(
      res,
      { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
      'Registration successful',
      201
    );
  } catch (err) {
    if (err instanceof ZodError) {
      sendError(res, err.issues[0]?.message ?? 'Validation error', 400);
      return;
    }
    sendError(res, 'Registration failed');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await User.findOne({ email: parsed.email.toLowerCase() }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isMatch = await user.comparePassword(parsed.password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const token = signToken({ _id: user._id.toString(), email: user.email, role: user.role });

    sendSuccess(res, {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      sendError(res, err.issues[0]?.message ?? 'Validation error', 400);
      return;
    }
    sendError(res, 'Login failed');
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, { _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch {
    sendError(res, 'Failed to fetch user');
  }
};
