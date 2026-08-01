// Garante que tenha acesso as rotas somente se estiver autenticado.

import { verify } from "jsonwebtoken";
import { authConfig } from "@/configs/auth";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";

interface TokenPayload {
  role: string
  sub: string
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new AppError("JWT token not found!", 401)
    }

    const [, token] = authHeader.split(" ")

    const { role, sub: user_id } = verify(token, authConfig.jwt.secret) as TokenPayload

    req.user = {
      id: user_id,
      role
    }

    return next()

  } catch (error) {
      throw new AppError("Invalid JWT token!", 401)
  }
}
