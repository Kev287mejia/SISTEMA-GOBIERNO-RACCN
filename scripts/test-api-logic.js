const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApiLogic() {
    const mes = 2;
    const anio = 2026;

    const fetchBalancesForPeriod = async (m, a) => {
        const start = new Date(a, m - 1, 1);
        const end = new Date(a, m, 0, 23, 59, 59);

        const entries = await prisma.accountingEntry.findMany({
            where: {
                estado: "APROBADO",
                deletedAt: null,
                fecha: {
                    gte: start,
                    lte: end
                }
            }
        });

        const balances = {
            activos: { balance: 0, subcategories: {} },
            pasivos: { balance: 0, subcategories: {} },
            patrimonio: { balance: 0, subcategories: {} },
            ingresos: { balance: 0, subcategories: {} },
            gastos: { balance: 0, subcategories: {} }
        };

        entries.forEach(entry => {
            const firstDigit = entry.cuentaContable[0];
            const monto = Number(entry.monto);

            let groupKey = "";
            switch (firstDigit) {
                case "1": groupKey = "activos"; break;
                case "2": groupKey = "pasivos"; break;
                case "3": groupKey = "patrimonio"; break;
                case "4": groupKey = "ingresos"; break;
                case "5": groupKey = "gastos"; break;
                default: return;
            }

            const isDebit = entry.tipo === "EGRESO";
            const isCredit = entry.tipo === "INGRESO";

            let increment = 0;
            if (groupKey === "activos" || groupKey === "gastos") {
                increment = isDebit ? monto : -monto;
            } else {
                increment = isCredit ? monto : -monto;
            }

            balances[groupKey].balance += increment;
        });

        return balances;
    };

    const current = await fetchBalancesForPeriod(mes, anio);
    console.log('API Final Current Balances:', JSON.stringify(current, null, 2));
}

testApiLogic()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
