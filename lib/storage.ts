import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

interface UploadResult {
    url: string;
    key: string;
}

/**
 * Servicio de Almacenamiento de Objetos (Object Storage)
 * Diseñado por: Desarrollador Senior
 * Capacidad: Local (Dev) / S3-MinIO (Prod)
 */
export class StorageService {
    private static s3Client: S3Client | null = null;

    private static getS3Client() {
        if (this.s3Client) return this.s3Client;

        const accessKeyId = process.env.S3_ACCESS_KEY_ID;
        const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
        const region = process.env.S3_REGION || "us-east-1";
        const endpoint = process.env.S3_ENDPOINT; // Para MinIO

        if (accessKeyId && secretAccessKey) {
            this.s3Client = new S3Client({
                region,
                credentials: { accessKeyId, secretAccessKey },
                endpoint: endpoint || undefined,
                forcePathStyle: !!endpoint, // Requerido para MinIO
            });
            return this.s3Client;
        }
        return null;
    }

    /**
     * Sube un archivo al almacenamiento configurado
     */
    static async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
        const s3 = this.getS3Client();
        const date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Generar path único
        const ext = filename.split('.').pop();
        const uniqueName = `${randomUUID()}.${ext}`;
        const key = `${year}/${month}/${uniqueName}`;

        if (s3 && process.env.S3_BUCKET) {
            // IMPLEMENTACIÓN S3/MINIO
            console.log(`[STORAGE] Subiendo a S3: ${key}`);
            await s3.send(
                new PutObjectCommand({
                    Bucket: process.env.S3_BUCKET,
                    Key: key,
                    Body: file,
                    ContentType: mimeType,
                    // ACL: 'public-read', // Depende de la política del bucket
                })
            );

            // Si tenemos un dominio de CDN o S3 público
            const baseUrl = process.env.S3_PUBLIC_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`;
            return {
                url: `${baseUrl}/${key}`,
                key
            };
        } else {
            // IMPLEMENTACIÓN LOCAL (FALLBACK SEGURO)
            console.log(`[STORAGE] S3 no configurado. Usando almacenamiento local: ${key}`);
            const relativeDir = join("uploads", year, month);
            const uploadDir = join(process.cwd(), "public", relativeDir);

            await mkdir(uploadDir, { recursive: true });
            const filepath = join(uploadDir, uniqueName);
            await writeFile(filepath, file);

            return {
                url: `/${relativeDir}/${uniqueName}`,
                key
            };
        }
    }

    /**
     * Obtiene la URL de descarga de un archivo
     * Útil si en el futuro se implementan URLs firmadas (Presigned URLs)
     */
    static async getFileUrl(key: string): Promise<string> {
        if (key.startsWith('http')) return key; // Ya es una URL completa

        const s3 = this.getS3Client();
        if (s3 && process.env.S3_BUCKET) {
            const baseUrl = process.env.S3_PUBLIC_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`;
            return `${baseUrl}/${key}`;
        }

        // Local
        return key.startsWith('/') ? key : `/${key}`;
    }
}
