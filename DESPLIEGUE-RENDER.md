# Despliegue en Render - Capa Gratuita

## 🆓 Servicios gratuitos recomendados para Render

### 1. Base de datos - MongoDB Atlas (Gratuito)
- **✅ Recomendado:** MongoDB Atlas M0 (512MB gratis)
- **❌ Evitar:** MongoDB local (no funciona en Render)

### 2. Autenticación - Simplificada
- **✅ Mantener:** Google OAuth (gratuito)
- **✅ Mantener:** GitHub OAuth (gratuito)
- **✅ Usar:** NextAuth (gratuito)

### 3. Almacenamiento de imágenes - Alternativas gratuitas
- **✅ Opción 1:** Cloudinary (gratuito hasta 25GB)
- **✅ Opción 2:** ImageKit (gratuito hasta 20GB)
- **❌ Evitar:** Firebase Storage (puede tener límites estrictos)

## 📝 Configuración paso a paso

### 1. Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un cluster M0 (gratis)
4. Configura un usuario de base de datos
5. Permite acceso desde cualquier IP (0.0.0.0/0 para Render)
6. Obtén la connection string

### 2. Configurar variables de entorno para producción

Crear archivo `.env.production`:
```env
# Database - MongoDB Atlas
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/blog?retryWrites=true&w=majority"

# Next Auth
NEXTAUTH_URL="https://tu-app.onrender.com"
NEXTAUTH_SECRET="tu-secret-key-aqui"

# Google OAuth
GOOGLE_ID="tu-google-client-id"
GOOGLE_SECRET="tu-google-client-secret"

# GitHub OAuth
GITHUB_ID="tu-github-client-id"
GITHUB_SECRET="tu-github-client-secret"

# Cloudinary (reemplazo de Firebase)
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

### 3. Configurar OAuth para producción

#### Google OAuth:
- Agregar redirect URI: `https://tu-app.onrender.com/api/auth/callback/google`

#### GitHub OAuth:
- Agregar callback URL: `https://tu-app.onrender.com/api/auth/callback/github`

### 4. Configurar Render

1. **Conectar repositorio:** Conecta tu repo de GitHub a Render
2. **Configurar build:**
   - Build Command: `bun install && bunx prisma generate && bun run build`
   - Start Command: `bun run start`
   - Environment: `Node`

3. **Variables de entorno en Render:**
   - Copia todas las variables de `.env.production`
   - Agrega cada una en el dashboard de Render

## 🔧 Modificaciones necesarias en el código

### 1. ✅ Cloudinary configurado
- Agregada dependencia `cloudinary`
- Creado `src/utils/cloudinary.js`
- Actualizado `next.config.js` para incluir dominios de Cloudinary

### 2. ✅ Archivos de configuración creados
- `.env.production` - Variables para producción
- `render.yaml` - Configuración automática para Render

## 🚀 Pasos para desplegar en Render

### 1. Preparar servicios externos

#### MongoDB Atlas (OBLIGATORIO)
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cluster M0 (gratuito)
3. Crear usuario y contraseña
4. Permitir acceso desde cualquier IP (0.0.0.0/0)
5. Obtener connection string

#### Cloudinary (RECOMENDADO)
1. Crear cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtener credenciales del dashboard:
   - Cloud Name
   - API Key
   - API Secret

#### OAuth Apps (OBLIGATORIO)
**Google OAuth:**
1. [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto y credenciales OAuth 2.0
3. Agregar URI: `https://tu-app.onrender.com/api/auth/callback/google`

**GitHub OAuth:**
1. [GitHub Developer Settings](https://github.com/settings/developers)
2. Crear OAuth App
3. Callback URL: `https://tu-app.onrender.com/api/auth/callback/github`

### 2. Configurar en Render

#### Método 1: Automático (usando render.yaml)
1. Subir código a GitHub
2. Conectar repositorio en Render
3. Render detectará automáticamente `render.yaml`
4. Configurar variables de entorno en el dashboard

#### Método 2: Manual
1. Conectar repositorio en Render
2. Configurar manualmente:
   - **Build Command:** `bun install && bunx prisma generate && bun run build`
   - **Start Command:** `bun run start`
   - **Environment:** Node

### 3. Variables de entorno en Render

Copia estas variables al dashboard de Render:

```
NODE_ENV=production
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/blog?retryWrites=true&w=majority
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=tu-secret-super-seguro
GOOGLE_ID=tu-google-id
GOOGLE_SECRET=tu-google-secret
GITHUB_ID=tu-github-id
GITHUB_SECRET=tu-github-secret
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

## 💰 Costos y límites de la capa gratuita

### Render (Gratuito)
- ✅ 750 horas/mes
- ✅ Sleep después de 15 min inactividad
- ✅ Custom domains
- ⚠️ Limitado a 512MB RAM

### MongoDB Atlas M0 (Gratuito)
- ✅ 512MB almacenamiento
- ✅ Conexiones ilimitadas
- ✅ Perfecto para blogs pequeños

### Cloudinary (Gratuito)
- ✅ 25GB almacenamiento
- ✅ 25GB bandwidth/mes
- ✅ Transformaciones básicas

## 🔍 Verificación y troubleshooting

### Comandos útiles
```bash
# Verificar build localmente
bun run build

# Verificar conexión a MongoDB
bunx prisma db push

# Generar secret para NextAuth
openssl rand -base64 32
```

### Problemas comunes
1. **Error de conexión DB:** Verificar IP whitelist en MongoDB Atlas
2. **OAuth errors:** Verificar URLs de callback
3. **Build failures:** Revisar logs en Render dashboard
4. **Sleep mode:** App se duerme después de 15 min (normal en plan gratuito)

## 📋 Checklist de despliegue

- [ ] MongoDB Atlas configurado
- [ ] Cloudinary configurado
- [ ] Google OAuth configurado
- [ ] GitHub OAuth configurado
- [ ] Variables de entorno configuradas
- [ ] Repositorio subido a GitHub
- [ ] Render conectado al repositorio
- [ ] App desplegada y funcionando

## 🎯 Próximos pasos post-despliegue

1. **Configurar dominio personalizado** (opcional)
2. **Optimizar imágenes** con Cloudinary
3. **Monitorear performance** en Render dashboard
4. **Backup de MongoDB** regularmente
5. **Actualizar OAuth URLs** si cambias dominio
