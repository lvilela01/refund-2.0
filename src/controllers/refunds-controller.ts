import { Request, Response } from "express";
import { z } from "zod"
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

const CategoriesEnum = z.enum([
  "food", "others", "services", "transport", "accommodation"
])

export class RefundsController{
  async create(req: Request, res: Response){
    const bodySchema = z.object({
      name: z.string().min(1, { message: "Informe o nome da solicitação" }).trim(),
      category: CategoriesEnum,
      amount: z.number().positive({message: "O valor precisa ser positivo!"}),
      filename: z.string().min(20)
    })

    const { name, category, amount, filename } = bodySchema.parse(req.body)

    if(!req.user?.id) {
      throw new AppError("Unauthorized", 401)
    }

    const refund = await prisma.refunds.create({
      data: {
        name, category, amount, filename, userId: req.user.id
      }
    })

    res.status(201).json(refund)
  }

  async index(req: Request, res: Response){
    const querySchema = z.object({
      name: z.string().optional().default("")
    })

    const { name } = querySchema.parse(req.query)

    const refunds = await prisma.refunds.findMany({
      where: {
        user: {
          name: {
            contains: name.trim()
          }
        }
      },
      orderBy: { createdAt: "desc"},
      include: { user: true }
    })

    res.json(refunds)
  }
}
