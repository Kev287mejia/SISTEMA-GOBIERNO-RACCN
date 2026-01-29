# MANUAL DE INSTALACIÓN Y DESPLIEGUE - SISTEMA GOBIERNO (ON-PREMISE)

Este documento detalla los requerimientos y pasos para desplegar el Sistema de Gobierno en un servidor físico/virtual dentro de la infraestructura de la institución.

## 1. REQUERIMIENTOS DEL SERVIDOR (Hardware & Software)

Para garantizar un rendimiento óptimo (SLA 99.9%) y la seguridad de los datos:

### Hardware Recomendado
*   **Procesador (CPU)**: Mínimo 2 vCPUs (Recomendado: 4 vCPUs para concurrencia alta de WebSockets).
*   **Memoria RAM**: Mínimo 4 GB (Recomendado: 8 GB o más).
*   **Almacenamiento**: Mínimo 40 GB SSD (NVMe preferible para la base de datos).
*   **Red**: Conexión estable con IP Estática dentro de la intranet o IP Pública si requiere acceso externo.

### Software Base (Sistema Operativo)
*   **OS**: Ubuntu Server 22.04 LTS (Recomendado) o RHEL 9 / CentOS Stream.
*   **Acceso**: SSH con privilegios `sudo`.

---

## 2. ESTRATEGIA DE DESPLIEGUE (Dos Opciones)

Ofrecemos dos métodos de instalación. **La Opción A (Docker)** es la estándar de la industria para garantizar estabilidad.

### OPCIÓN A (Recomendada): CONTENEDORES (Docker)
Esta opción aísla el sistema, evitando conflictos con otros sistemas en el mismo servidor.

**Prerrequisitos:**
*   Docker Engine instalado.
*   Docker Compose instalado.

**Pasos de Instalación Rápida:**
1.  Copiar la carpeta del proyecto al servidor (ej. `/opt/sistema-gobierno`).
2.  Crear el archivo `.env` de producción con las credenciales de la institución.
3.  Ejecutar el despliegue:
    ```bash
    docker compose up -d --build
    ```
4.  El sistema estará activo en el puerto `3000`.

### OPCIÓN B (Tradicional): NATIVO (Node.js + PM2)
Usar esta opción si la institución tiene políticas estrictas contra el uso de contenedores.

**Prerrequisitos:**
*   Node.js v20 LTS.
*   PostgreSQL 15 instalado y ejecutándose localmente.
*   PM2 (`npm install -g pm2`).

**Pasos:**
1.  `npm install --production`
2.  `npx prisma run build` (Generar cliente de BD)
3.  `npm run build` (Compilar aplicación)
4.  `pm2 start server.js --name "sistema-gobierno"`

---

## 3. CONFIGURACIÓN DE RED Y SEGURIDAD (Nginx Reverse Proxy)

No se debe exponer el puerto 3000 directamente. Se requiere configurar **Nginx** como proxy inverso para manejar seguridad SSL y balanceo de carga.

**Archivo de configuración sugerido (`/etc/nginx/sites-available/sistema-gobierno`):**

```nginx
server {
    listen 80;
    server_name sistema.entidad.gob.hn;

    # Redirección forzada a HTTPS (Recomendado)
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade'; # Crítico para WebSockets (Socket.io)
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Headers de seguridad
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Configuración específica para Socket.io
    location /socket.io/ {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://localhost:3000/socket.io/;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
}
```

## 4. BASE DE DATOS Y BACKUPS
Si usan la implementación en Docker, la base de datos está contenida pero usa un volumen persistente.
Para entornos de Gobierno, se recomienda configurar un **Cron Job** diario que realice el dump de la base de datos:

```bash
# Ejemplo de backup diario a las 2 AM
0 2 * * * docker exec -t sistema_gobierno_db pg_dumpall -c -U postgres > /backups/db_backup_$(date +%F).sql
```
