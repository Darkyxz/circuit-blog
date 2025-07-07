# Configuración del Blog Personal

## ✅ Pasos completados

1. **Dependencias instaladas** con Bun
2. **Archivo `.env.local`** creado con todas las variables necesarias
3. **Prisma Client** generado

## 🔧 Credenciales necesarias para funcionar

### 1. Base de datos MongoDB
```env
DATABASE_URL="mongodb://localhost:27017/nextjs-blog"
```
**Opciones:**
- MongoDB local: Instala MongoDB localmente
- MongoDB Atlas: Crea una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### 2. NextAuth Secret
```env
NEXTAUTH_SECRET="your-secret-key-here"
```
**Generar:** Ejecuta `openssl rand -base64 32` o usa cualquier string aleatorio seguro

### 3. Google OAuth (para login con Google)
```env
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"
```
**Configurar:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3000/api/auth/callback/google` como URI de redirección

### 4. GitHub OAuth (para login con GitHub)
```env
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```
**Configurar:**
1. Ve a [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 5. Firebase (para almacenamiento de imágenes)
```env
FIREBASE="your-firebase-api-key"
```
**Configurar:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto nuevo
3. Habilita Firebase Storage
4. Obtén la API Key desde la configuración del proyecto

## 🚀 Comandos disponibles

```bash
# Desarrollo
bun run dev

# Build para producción
bun run build

# Iniciar en producción
bun run start

# Linting
bun run lint

# Comandos de Prisma
bunx prisma generate    # Genera el cliente
bunx prisma db push     # Sincroniza el esquema con la DB
bunx prisma studio      # Interfaz visual para la DB
```

## 📋 Próximos pasos

1. **Configurar MongoDB** (local o Atlas)
2. **Configurar autenticación** (Google/GitHub OAuth)
3. **Configurar Firebase** para imágenes
4. **Actualizar variables de entorno** en `.env.local`
5. **Sincronizar base de datos** con `bunx prisma db push`
6. **Probar la aplicación** con `bun run dev`

## 🔍 Verificación

Después de configurar las credenciales, puedes verificar que todo funciona:

```bash
# Verificar conexión a la base de datos
bunx prisma db push

# Iniciar el servidor de desarrollo
bun run dev
```

La aplicación estará disponible en: http://localhost:3000
