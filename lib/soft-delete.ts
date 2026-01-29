import { Prisma } from "@prisma/client"

/**
 * Soft delete filter - excludes soft-deleted records
 */
export const notDeleted = {
  deletedAt: null,
} satisfies Prisma.UserWhereInput

/**
 * Include deleted filter - includes soft-deleted records
 */
export const includeDeleted = {
  OR: [
    { deletedAt: null },
    { deletedAt: { not: null } },
  ],
} satisfies Prisma.UserWhereInput

/**
 * Only deleted filter - only soft-deleted records
 */
export const onlyDeleted = {
  deletedAt: { not: null },
} satisfies Prisma.UserWhereInput

/**
 * Soft delete a record by setting deletedAt timestamp
 */
export async function softDelete<T extends { deletedAt: Date | null }>(
  model: any,
  id: string
): Promise<T> {
  return model.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

/**
 * Restore a soft-deleted record
 */
export async function restoreSoftDelete<T extends { deletedAt: Date | null }>(
  model: any,
  id: string
): Promise<T> {
  return model.update({
    where: { id },
    data: { deletedAt: null },
  })
}
