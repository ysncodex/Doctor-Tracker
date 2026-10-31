import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select('name email role createdAt');

  if (!user) {
    throw new ApiError(401, 'User account no longer exists');
  }

  return user;
}
