import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword')  // can be null
  const page = parseInt(searchParams.get('page') || '1')  // if don't have page, it will be '1'
  const limit = 8  // 1 page only have 8 images

  const images = await prisma.image.findMany({  // retrieve all image data.
    where: keyword
      // If a keyword is present, the search will only look for images that "have some keywords" matching the submitted name.
      ? { keywords: { some: { name: keyword } } }
      // If there is no keyword, the value "undefined" will be returned. 
      // Prisma will understand this to mean "include all images, no filtering required."
      : undefined,
    // Also, retrieve the keywords associated with that image from the keyword table.
    include: { keywords: true },
    // If page = 1: (1-1) * 8 = 0 (do not skip any, take numbers 1-8)
    // If page = 2: (2-1) * 8 = 8 (skip the first 8, take numbers 9-16)
    skip: (page - 1) * limit,  // how much skip
    take: limit,  // only 8 images
  })

  return NextResponse.json(images)
}