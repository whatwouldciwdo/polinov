# Panduan Deployment Polinov ke Server Ubuntu via Docker

Panduan ini berisi langkah-langkah lengkap untuk menjalankan aplikasi Polinov di server Ubuntu menggunakan Docker & Docker Compose, dengan koneksi database remote PostgreSQL yang sudah ditetapkan.

---

## 1. Persiapan Server Ubuntu (Prerequisites)

Pastikan server Ubuntu sudah terinstal **Docker** dan **Docker Compose**.

Jika belum terinstal, jalankan perintah berikut di Ubuntu:

```bash
# Update repository Ubuntu
sudo apt update && sudo apt upgrade -y

# Install dependensi
sudo apt install -y curl ca-certificates gnupg lsb-release

# Install Docker official & Docker Compose plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Tambahkan user saat ini ke group docker (agar bisa run docker tanpa sudo)
sudo usermod -aG docker $USER
newgrp docker
```

Verifikasi instalasi:
```bash
docker --version
docker compose version
```

---

## 2. Clone Repository

Clone repository Polinov ke server Ubuntu:

```bash
git clone https://github.com/whatwouldciwdo/polinov.git
cd polinov
```

---

## 3. Konfigurasi Environment (`.env`)

Buat file `.env` dari template `.env.example`:

```bash
cp .env.example .env
```

Periksa atau sesuaikan isi `.env`:
```bash
nano .env
```

Isi konfigurasi standar:
```env
# Database PostgreSQL remote (tetap menggunakan url yang sudah ditetapkan)
DATABASE_URL="postgresql://postgres:Cilego2026.@10.8.140.69:5432/polinov?schema=public&connection_limit=10&pool_timeout=20"

# NextAuth Secret
NEXTAUTH_SECRET="inovasi-2026"

# Sesuaikan dengan IP Server Ubuntu atau Domain Anda
# Contoh: http://10.8.140.xxx:3113 atau https://polinov.perusahaan.com
NEXTAUTH_URL="http://localhost:3113"
```

> **Catatan Database Remote**:
> Pastikan server Ubuntu memiliki akses jaringan ke IP database `10.8.140.69` pada port `5432`.
> Anda bisa mengecek konektivitas dengan perintah:
> ```bash
> nc -zv 10.8.140.69 5432
> ```

---

## 4. Persiapkan Izin Direktori Uploads

Aplikasi menyimpan file berkas calon dan foto di `./public/uploads`.
Di dalam container, aplikasi berjalan dengan user non-root (UID `1001`). Berikan izin direktori agar container dapat menulis file upload:

```bash
mkdir -p public/uploads/candidates
sudo chown -R 1001:1001 public/uploads
sudo chmod -R 775 public/uploads
```

---

## 5. Build dan Jalankan Container

Jalankan perintah Docker Compose untuk membangun image dan menjalankan aplikasi di background:

```bash
docker compose up -d --build
```

---

## 6. Verifikasi Status dan Log

Cek status container:
```bash
docker compose ps
```

Melihat log aplikasi secara real-time:
```bash
docker compose logs -f polinov-app
```

Aplikasi sekarang sudah berjalan dan dapat diakses di:
`http://<IP_SERVER_UBUNTU>:3113`

---

## 7. Pemeliharaan & Perintah Berguna

- **Menghentikan aplikasi:**
  ```bash
  docker compose down
  ```

- **Restart aplikasi:**
  ```bash
  docker compose restart
  ```

- **Update aplikasi setelah git push perubahan baru:**
  ```bash
  git pull origin main
  docker compose up -d --build
  ```

- **Melihat penggunaan resource:**
  ```bash
  docker stats
  ```
