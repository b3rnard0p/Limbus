import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
};

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw new AppError("Email e senha são obrigatórios.", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTS);

    return res.json({
      token: accessToken,
      user: {
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new AppError("Sessão expirada. Faça login novamente.", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      throw new AppError("Sessão inválida. Faça login novamente.", 401);
    }

    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      throw new AppError("Sessão não encontrada.", 401);
    }

    const newAccessToken = generateAccessToken(user);

    return res.json({ token: newAccessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }
    res.clearCookie("refreshToken", { ...REFRESH_COOKIE_OPTS, maxAge: 0 });
    return res.json({ status: "success", message: "Logout realizado com sucesso." });
  } catch (err) {
    next(err);
  }
}
