import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

const images = [
  { url: 'https://placehold.co/600x400', keywords: ['nature', 'landscape'] },
  { url: 'https://placehold.co/400x600', keywords: ['portrait', 'people'] },
  { url: 'https://placehold.co/800x600', keywords: ['nature', 'water'] },
  { url: 'https://placehold.co/500x500', keywords: ['city', 'landscape'] },
  { url: 'https://placehold.co/700x400', keywords: ['people', 'city'] },
  { url: 'https://placehold.co/400x800', keywords: ['portrait', 'nature'] },
  { url: 'https://placehold.co/600x600', keywords: ['water', 'landscape'] },
  { url: 'https://placehold.co/900x600', keywords: ['city', 'people'] },
  { url: 'https://placehold.co/600x400', keywords: ['nature', 'landscape'] },
  { url: 'https://placehold.co/400x600', keywords: ['portrait', 'people'] },
  { url: 'https://placehold.co/800x600', keywords: ['nature', 'water'] },
  { url: 'https://placehold.co/500x500', keywords: ['city', 'landscape'] },
  { url: 'https://placehold.co/700x400', keywords: ['people', 'city'] },
  { url: 'https://placehold.co/400x800', keywords: ['portrait', 'nature'] },
  { url: 'https://placehold.co/600x600', keywords: ['water', 'landscape'] },
  { url: 'https://placehold.co/900x600', keywords: ['city', 'people'] },
]

async function main() {
  for (const img of images) {
    // await mean waiting for the first image is seeded then, the next image will start.
    await prisma.image.create({
      data: {
        url: img.url,
        keywords: {
          connectOrCreate: img.keywords.map((k) => ({
            where: { name: k },   // if there is keyword in db, retrieve keyword ID to connect with this image.
            create: { name: k },  // if keyword is not in db, create new keyword then connect with this image.
          })),
        },
      },
    })
  }
  console.log('Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())  // Don't close the connection; the database might be full.