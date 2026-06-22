import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../utils/firebase';
import { sendRegistrationEmail, sendResetPasswordEmail } from '../utils/nodemailer';
import { logActivity } from '../utils/activity';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforvolunteerhub';

// Register User
export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role = 'volunteer',
      phone = '',
      profileImage,
      age,
      gender,
      address,
      occupation,
      skills,
      interests,
      availability,
      location,
      resumeUrl,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    // Check if user already exists
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = Math.random().toString(36).substring(7);
    const userPayload = {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      profileImage: profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').doc(userId).set(userPayload);

    let volunteerId = null;
    if (role === 'volunteer') {
      volunteerId = 'vol-' + Math.random().toString(36).substring(7);
      await db.collection('volunteers').doc(volunteerId).set({
        userId,
        age: age ? parseInt(age) : null,
        gender: gender || 'Male',
        address: address || '',
        occupation: occupation || '',
        skills: skills || '',
        interests: interests || '',
        availability: availability || 'Flexible',
        location: location || '',
        hoursCompleted: 0.0,
        resumeUrl: resumeUrl || '',
        status: 'pending'
      });
    }

    await sendRegistrationEmail(email, name);
    await logActivity(userId, 'Register', `User ${name} registered successfully as ${role}`);

    return res.status(201).json({
      message: 'Registration successful! Your application is pending review.',
      userId,
      volunteerId
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Login User
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    let volunteerId = undefined;
    if (user.role === 'volunteer') {
      const volSnapshot = await db.collection('volunteers').where('userId', '==', user.id).get();
      if (!volSnapshot.empty) {
        volunteerId = volSnapshot.docs[0].id;
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, volunteerId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    await logActivity(user.id, 'Login', `User ${user.name} logged in successfully`);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        volunteerId
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Google Auth Placeholder
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { email, name, profileImage } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required for Google Auth.' });
    }

    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    let user;
    let volunteerId;

    if (userSnapshot.empty) {
      const userId = Math.random().toString(36).substring(7);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = {
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: 'volunteer',
        phone: '',
        profileImage: profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.collection('users').doc(userId).set(user);

      volunteerId = 'vol-' + Math.random().toString(36).substring(7);
      await db.collection('volunteers').doc(volunteerId).set({
        userId,
        age: null,
        gender: 'Male',
        address: '',
        occupation: '',
        skills: '',
        interests: '',
        availability: 'Flexible',
        location: '',
        hoursCompleted: 0.0,
        resumeUrl: '',
        status: 'pending'
      });

      await sendRegistrationEmail(email, name);
      await logActivity(userId, 'Google Register', `Volunteer ${name} registered via Google`);
    } else {
      const userDoc = userSnapshot.docs[0];
      user = { id: userDoc.id, ...userDoc.data() };
      if (user.role === 'volunteer') {
        const volSnapshot = await db.collection('volunteers').where('userId', '==', user.id).get();
        if (!volSnapshot.empty) {
          volunteerId = volSnapshot.docs[0].id;
        }
      }
      await logActivity(user.id, 'Google Login', `User ${user.name} logged in via Google`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, volunteerId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        volunteerId
      }
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Forgot Password Flow
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    const userDoc = userSnapshot.docs[0];
    const resetToken = jwt.sign({ id: userDoc.id }, JWT_SECRET, { expiresIn: '1h' });

    await db.collection('users').doc(userDoc.id).update({ resetToken });

    await sendResetPasswordEmail(email, resetToken);
    await logActivity(userDoc.id, 'Forgot Password Request', `Sent password reset email to ${email}`);

    return res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userRef = db.collection('users').doc(decoded.id);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userData = userSnap.data();
    if (userData.resetToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRef.update({
      password: hashedPassword,
      resetToken: null
    });

    await logActivity(decoded.id, 'Reset Password', `User password reset successfully`);

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(400).json({ message: 'Invalid or expired reset token.', error: error.message });
  }
};