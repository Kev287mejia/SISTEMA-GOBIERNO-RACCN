import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  // Durante el build, a veces la URL no está disponible. 
  // Pasamos una URL de respaldo para que Prisma no detenga la compilación.
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
  
  return new PrismaClient({
    // Usamos el formato que Prisma 7 espera cuando no hay config externa
    datasources: {
      db: {
        url: dbUrl
      }
    }
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
