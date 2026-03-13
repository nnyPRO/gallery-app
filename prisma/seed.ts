import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

const images = [
  { url: 'https://placehold.co/600x400', keywords: ['nature', 'landscape'] },
  { url: 'https://placehold.co/400x600', keywords: ['nature', 'portrait'] },
  { url: 'https://placehold.co/800x600', keywords: ['nature', 'water'] },
  { url: 'https://placehold.co/500x700', keywords: ['nature', 'city'] },
  { url: 'https://placehold.co/400x600', keywords: ['portrait', 'people'] },
  { url: 'https://placehold.co/600x800', keywords: ['portrait', 'city'] },
  { url: 'https://placehold.co/700x500', keywords: ['portrait', 'landscape'] },
  { url: 'https://placehold.co/500x400', keywords: ['portrait', 'water'] },
  { url: 'https://placehold.co/800x600', keywords: ['landscape', 'water'] },
  { url: 'https://placehold.co/600x900', keywords: ['landscape', 'city'] },
  { url: 'https://placehold.co/400x500', keywords: ['landscape', 'people'] },
  { url: 'https://placehold.co/900x600', keywords: ['water', 'city'] },
  { url: 'https://placehold.co/500x800', keywords: ['water', 'people'] },
  { url: 'https://placehold.co/700x400', keywords: ['people', 'city'] },
  { url: 'https://placehold.co/600x500', keywords: ['people', 'landscape'] },
  { url: 'https://placehold.co/800x900', keywords: ['city', 'nature'] },
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