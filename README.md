# 🚀 Quantity Measurement Frontend

---

## 📦 Setup & Run (Frontend)

```bash
cd frontend
npm install
npm run dev
```

👉 Open in browser:  
http://localhost:5173/

---

## 🔗 Backend Connection

This frontend is connected to the Spring Boot backend using the **Vite dev-server proxy**.

### 🔁 Proxy Configuration

- `/auth/*` → `http://localhost:8082/auth/*`
- `/api/*` → `http://localhost:8082/api/*`

### ✅ Key Points

- No hardcoded backend URL is used  
- All API calls use relative paths  
- Proxy handles routing during development  

---

## ⚙️ Backend (Spring Boot)

Backend runs on:

```
http://localhost:8082
```

Configured in:

```
src/main/resources/application.properties
```

---

## ▶️ Run Backend

If Maven is installed:

```bash
mvn spring-boot:run
```

💡 Tip: If Maven is not installed, use:

```bash
./mvnw spring-boot:run
```

---

## ⚛️ Tech Stack

- React  
- TypeScript  
- Vite  
- ESLint  

---

## 🔌 Vite React Plugins

- `@vitejs/plugin-react` (uses Oxc)  
- `@vitejs/plugin-react-swc` (uses SWC)  

---

## ⚡ React Compiler

The React Compiler is **not enabled by default** due to its impact on development and build performance.

👉 You can enable it by following official React documentation.

---

## 📌 Notes

- Make sure backend is running before frontend  
- Ports must match:
  - Frontend → 5173  
  - Backend → 8082  
- Proxy helps avoid CORS issues  

---
