# MediVoz Backend - Node.js + MongoDB

## 📋 Requisitos

- **Node.js** (v14+) instalado
- **MongoDB Atlas** con acceso configurado (ya tienes)
- **NPM** (viene con Node.js)

---

## 🚀 Instalación y Ejecución

### Paso 1: Descarga los archivos

Descarga estos 4 archivos en una carpeta llamada `medivoz-backend`:
- `package.json`
- `app.js`
- `.env`
- Este README

Estructura:
```
medivoz-backend/
├── app.js
├── package.json
├── .env
└── README_BACKEND.md
```

### Paso 2: Instala las dependencias

Abre PowerShell o CMD en esa carpeta y ejecuta:

```bash
npm install
```

Esto descargará: Express, MongoDB driver, CORS, dotenv

### Paso 3: Ejecuta el servidor

```bash
npm start
```

Deberías ver:
```
✅ Conectado a MongoDB Atlas
🚀 Servidor corriendo en http://localhost:3000
📊 Base de datos: medivoz
```

**¡Éxito!** El backend está conectado a tu MongoDB.

---

## 📡 Endpoints disponibles

### 1. **POST /api/login**
Inicia sesión con usuario y contraseña.

**Request:**
```json
{
  "usuario": "juan123",
  "password": "miPassword123!"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "id": "...",
    "nombre": "Juan Pérez",
    "usuario": "juan123",
    "especialidad": "Cardiólogo",
    "email": "juan@ejemplo.com"
  }
}
```

---

### 2. **POST /api/register**
Registra un nuevo usuario (médico).

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "usuario": "juan123",
  "email": "juan@ejemplo.com",
  "password": "miPassword123!",
  "especialidad": "Cardiólogo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": "...",
    "usuario": "juan123"
  }
}
```

---

### 3. **POST /api/paciente/registrar**
Registra un nuevo paciente.

**Request:**
```json
{
  "nombre": "Juan",
  "apellidoP": "Pérez",
  "apellidoM": "García",
  "fechaNacimiento": "1990-05-20",
  "sexo": "Masculino",
  "telefono": "5551234567",
  "correo": "juan@ejemplo.com",
  "tipoSangre": "O+",
  "direccion": "Calle Principal 123",
  "alergias": "Penicilina, Marisco"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Paciente registrado exitosamente",
  "data": {
    "id": "...",
    "expediente": "EXP-000001"
  }
}
```

---

### 4. **GET /api/pacientes**
Obtiene la lista de todos los pacientes.

**Request:** `http://localhost:3000/api/pacientes`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "expediente": "EXP-000001",
      "nombre": "Juan",
      "apellidoP": "Pérez",
      "telefono": "5551234567",
      "estado": "Activo",
      "fechaRegistro": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### 5. **POST /api/consulta/guardar**
Guarda una nueva consulta médica.

**Request:**
```json
{
  "pacienteId": "60d5ec49c1234567890abcde",
  "medico": "Dr. Carlos López",
  "tipoConsulta": "Primera consulta",
  "categoria": "Cardiología",
  "severidad": "Moderada",
  "presion": "120/80",
  "frecuencia": "72",
  "temperatura": "37.0",
  "peso": "75",
  "sintomas": "Dolor en el pecho leve",
  "diagnosticos": ["Taquicardia", "Estrés"],
  "medicamentos": [
    {"nombre": "Atenolol", "dosis": "50mg"},
    {"nombre": "Ansiolítico", "dosis": "1 cada 8h"}
  ],
  "alergias": ["Penicilina"],
  "notas": "Paciente estresado por trabajo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consulta guardada exitosamente",
  "data": {
    "id": "..."
  }
}
```

---

### 6. **GET /api/consultas/:pacienteId**
Obtiene todas las consultas de un paciente específico.

**Request:** `http://localhost:3000/api/consultas/60d5ec49c1234567890abcde`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "pacienteId": "...",
      "medico": "Dr. Carlos López",
      "fecha": "2024-01-15T10:30:00Z",
      "diagnosticos": ["Taquicardia"],
      "medicamentos": [...]
    }
  ]
}
```

---

### 7. **GET /api/test**
Prueba si el servidor está funcionando.

**Request:** `http://localhost:3000/api/test`

**Response:**
```json
{
  "success": true,
  "message": "✅ Servidor funcionando correctamente"
}
```

---

## 🔗 Conectar tu Frontend

Tu archivo `Index_ACTUALIZADO.html` ya está configurado para comunicarse con el backend.

**Pasos:**

1. Reemplaza tu `Index.html` con el nuevo `Index_ACTUALIZADO.html` (o copia el código)
2. Cambia el nombre del archivo a `Index.html`
3. Asegúrate de que el Backend esté corriendo (`npm start`)
4. Abre `Index.html` en tu navegador
5. Intenta hacer login con un usuario que exista en tu MongoDB

---

## 🗄️ Estructura de la colección `usuarios` en MongoDB

Tu colección debería verse así:

```javascript
{
  _id: ObjectId("..."),
  nombre: "Dr. Carlos López",
  usuario: "carlos123",
  email: "carlos@ejemplo.com",
  password: "Password123!",  // ⚠️ Encriptar en producción
  especialidad: "Médico General",
  fechaRegistro: ISODate("2024-01-01")
}
```

---

## ⚠️ Notas de Seguridad

1. **NO compartas el archivo `.env`** en GitHub o espacios públicos
2. **NO uses contraseñas en texto plano** en producción (usa bcrypt)
3. **Regenera tu contraseña de MongoDB Atlas** que compartiste aquí
4. Agrega `.env` al `.gitignore` de tu repositorio:

```
# .gitignore
.env
node_modules/
```

---

## 🐛 Solución de problemas

### "Error: conectando a MongoDB"
- Verifica que la URL en `.env` sea correcta
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas

### "Cannot find module 'express'"
- Ejecuta `npm install` nuevamente

### "Puerto 3000 ya está en uso"
- Cambia el `PORT` en `.env` a otro (ej: 3001)

### "CORS error en el navegador"
- El archivo CORS ya está configurado en `app.js`
- Si aún hay problemas, verifica que el servidor esté en `http://localhost:3000`

---

## 📝 Próximos pasos

1. ✅ Crear endpoint de login (ya hecho)
2. 🔄 Crear endpoint para guardar pacientes
3. 🔄 Crear endpoint para obtener pacientes
4. 🔄 Encriptar contraseñas con bcrypt
5. 🔄 Agregar autenticación JWT

---

## ✅ Verificar conexión

Abre tu navegador y ve a:
```
http://localhost:3000/api/test
```

Si ves:
```json
{"success":true,"message":"✅ Servidor funcionando correctamente"}
```

**¡Todo está conectado! ✅**

