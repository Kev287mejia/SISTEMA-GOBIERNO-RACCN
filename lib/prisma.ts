// MOCK PRISMA CLIENT FOR DEMO MODE
// This prevents the application from crashing when no database is available.

const mockModel = {
  findMany: async () => [],
  findUnique: async () => null,
  findFirst: async () => null,
  count: async () => 0,
  create: async ({ data }: any) => ({ id: "mock-id", ...data }),
  update: async ({ data }: any) => ({ id: "mock-id", ...data }),
  delete: async () => ({ id: "mock-id" }),
  upsert: async ({ create }: any) => ({ id: "mock-id", ...create }),
  aggregate: async () => ({ _sum: {}, _avg: {}, _count: 0 }),
  groupBy: async () => [],
};

const proxy: any = new Proxy({}, {
  get: (target, prop) => {
    if (prop === "$connect" || prop === "$disconnect") return async () => {};
    if (prop === "$transaction") return async (fn: any) => {
        if (typeof fn === 'function') return fn(proxy);
        return fn;
    };
    return mockModel;
  }
});

export const prisma = proxy;
