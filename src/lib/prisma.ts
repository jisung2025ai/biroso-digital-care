import { prisma } from './db'

export function getDb() {
  return prisma
}
