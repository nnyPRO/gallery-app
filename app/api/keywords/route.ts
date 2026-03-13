import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter } as any)

export async function GET() {
    const keywords = await prisma.keyword.findMany()
    return NextResponse.json(keywords)
}