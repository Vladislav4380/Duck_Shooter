# 🚀 Deployment Guide / Гайд розгортання

## Українська 🇺🇦

### Розгортання на Vercel

Vercel — найпростіший спосіб розгорнути гру.

#### Крок 1: Підготовка

```bash
cd Duck_Shooter
npm run build
```

#### Крок 2: Завантаження на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/duck-shooter.git
git push -u origin main
```

#### Крок 3: Розгортання на Vercel

1. Перейдіть на https://vercel.com
2. Натисніть "New Project"
3. Виберіть ваш репозиторій з GitHub
4. Vercel автоматично виявить Angular проект
5. Натисніть "Deploy"

### Розгортання на власному сервері

#### Вимоги

- Node.js 18+
- npm або pnpm
- **HTTPS** (обов'язково для Telegram Mini Apps!)

#### Крок 1: Побудова

```bash
npm run build
```

#### Крок 2: Завантаження на сервер

```bash
scp -r dist/duck-shooter/* user@your-server.com:/var/www/html/
```

#### Крок 3: Налаштування веб-сервера

**Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache:**

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/html

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    <Directory /var/www/html>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
</VirtualHost>
```

### Інтеграція з Telegram

1. Напишіть @BotFather у Telegram
2. Виберіть вашого бота
3. Натисніть "Menu Button"
4. Встановіть URL вашої гри

Приклад URL:
```
https://your-domain.com
```

---

## English 🇬🇧

### Deployment on Vercel

Vercel is the easiest way to deploy the game.

#### Step 1: Build

```bash
cd Duck_Shooter
npm run build
```

#### Step 2: Upload to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/duck-shooter.git
git push -u origin main
```

#### Step 3: Deploy on Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Vercel will auto-detect Angular project
5. Click "Deploy"

### Deployment on Your Own Server

#### Requirements

- Node.js 18+
- npm or pnpm
- **HTTPS** (required for Telegram Mini Apps!)

#### Step 1: Build

```bash
npm run build
```

#### Step 2: Upload to Server

```bash
scp -r dist/duck-shooter/* user@your-server.com:/var/www/html/
```

#### Step 3: Configure Web Server

**Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache:**

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/html

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    <Directory /var/www/html>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
</VirtualHost>
```

### Telegram Integration

1. Message @BotFather on Telegram
2. Select your bot
3. Click "Menu Button"
4. Set your game URL

Example URL:
```
https://your-domain.com
```
