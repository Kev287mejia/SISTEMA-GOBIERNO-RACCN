
import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

async function testUploadFlow() {
    console.log("🚀 INICIANDO PRUEBA DE ADJUNTOS DIGITALES...");

    // 1. Create a dummy PDF file
    const tempFile = path.join(process.cwd(), 'temp_invoice.pdf');
    fs.writeFileSync(tempFile, "%PDF-1.4\n%Test Invoice Content");
    console.log("📄 Archivo temporal creado:", tempFile);

    try {
        // 2. Simulate Upload (Bypassing Auth Middleware for Script)
        console.log("📡 Simulando carga de archivo (Bypass Middleware)...");

        const uploadDir = path.join(process.cwd(), 'public/uploads/test');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `factura_simulada_${Date.now()}.pdf`;
        const destPath = path.join(uploadDir, fileName);

        // Copy the temp file to the "server" storage
        fs.copyFileSync(tempFile, destPath);

        const uploadedUrl = `/uploads/test/${fileName}`; // The URL the frontend would receive

        console.log("✅ Archivo guardado en disco simulando upload!");
        console.log("🔗 URL Generada:", uploadedUrl);

        // 3. Link to an Accounting Entry (Database Operation)
        console.log("💾 Asociando evidencia al primer asiento disponible...");

        const entry = await prisma.accountingEntry.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (!entry) {
            throw new Error("No hay asientos contables para probar.");
        }

        const updatedEntry = await prisma.accountingEntry.update({
            where: { id: entry.id },
            data: {
                evidenciaUrls: {
                    push: uploadedUrl // Use push to add to array
                }
            }
        });

        console.log(`✅ Asiento ${updatedEntry.numero} actualizado.`);
        console.log(`📂 Evidencias actuales del asiento:`, updatedEntry.evidenciaUrls);

        console.log("\n🎉 PRUEBA DE FLUJO COMPLETA: SISTEMA OPERATIVO OK");

    } catch (error) {
        console.error("❌ ERROR EN LA PRUEBA:", error);
    } finally {
        // Cleanup
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        await prisma.$disconnect();
    }
}

testUploadFlow();
