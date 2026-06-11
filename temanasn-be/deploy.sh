#!/bin/bash
# ==============================================
# Deploy Script - apps.orbitasteroid.com
# Jalankan di server: bash deploy.sh
# ==============================================

set -e  # Berhenti jika ada error

APP_DIR="/home/orbitasteroid-apps/htdocs/apps.orbitasteroid.com"

echo "======================================"
echo "   TemanASN Backend - Deploy Script   "
echo "======================================"

# 1. Masuk ke direktori aplikasi
cd $APP_DIR
echo "[1/6] Working directory: $(pwd)"

# 2. Install dependencies (tanpa devDependencies)
echo "[2/6] Installing dependencies..."
npm install --omit=dev

# 3. Generate Prisma Client
echo "[3/6] Generating Prisma client..."
npx prisma generate

# 4. Jalankan database migration
echo "[4/6] Running database migrations..."
npx prisma migrate deploy

# 5. Buat folder yang dibutuhkan
echo "[5/6] Creating required directories..."
mkdir -p public/uploads
mkdir -p /home/orbitasteroid-apps/logs

# 6. Restart aplikasi via PM2 (jika sudah running) atau start baru
echo "[6/6] Starting/Restarting application..."
if pm2 list | grep -q "temanasn-be"; then
    pm2 restart temanasn-be
    echo "✅ Application restarted successfully!"
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo "✅ Application started successfully!"
fi

echo ""
echo "======================================"
echo "✅ Deploy selesai!"
echo "   URL: https://apps.orbitasteroid.com"
echo "   Port: 3003"
echo "======================================"

# Tampilkan status PM2
pm2 status temanasn-be
