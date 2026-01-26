# 🚀 GUIA RÁPIDO: Deploy na Vercel

## ✅ Problema Resolvido

**Erro:** `A variável de ambiente "DATABASE_URL" faz referência ao segredo "database_url", que não existe.`

**Solução:** Removi as referências de secrets do `vercel.json`. Agora você precisa adicionar as variáveis **diretamente no Dashboard da Vercel**.

---

## 📋 Passo a Passo Rápido

### **1️⃣ Commit a Correção**

```bash
git add vercel.json CONFIGURAR-VARIAVEIS-VERCEL.md
git commit -m "fix: remove secret references from vercel.json"
git push origin main
```

---

### **2️⃣ Configure Variáveis na Vercel**

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. **Settings** → **Environment Variables**
4. Clique em **Add New**

---

### **3️⃣ Adicione TODAS estas variáveis:**

#### **Database (Neon):**
```
DATABASE_URL = postgresql://user:password@host.neon.tech/neondb?sslmode=require
```
*(Copie do Neon Dashboard → Connection String)*

#### **Firebase (10 variáveis):**
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123456:web:abc123
```
*(Copie do Firebase Console → Project Settings → Config)*

#### **Google Cloud:**
```
GOOGLE_CLOUD_PROJECT_ID = seu-projeto-gcp
GOOGLE_CLOUD_LOCATION = us-central1
```

#### **Service Account (Base64):**
```
GOOGLE_APPLICATION_CREDENTIALS_BASE64 = eyJ0eXBlIjoi...
```

**Como converter para Base64:**
```powershell
# PowerShell
$content = Get-Content -Path "service-account-key.json" -Raw
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
```

---

### **4️⃣ IMPORTANTE: Marque os 3 Ambientes**

Para **CADA variável**, marque:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

---

### **5️⃣ Redeploy (se necessário)**

Se o deploy não iniciar automaticamente:

1. Vá em **Deployments**
2. Clique nos **3 pontos** (⋮)
3. Clique em **Redeploy**

---

## ✅ Checklist Completo

- [ ] `DATABASE_URL` (Neon)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `GOOGLE_CLOUD_PROJECT_ID`
- [ ] `GOOGLE_CLOUD_LOCATION`
- [ ] `GOOGLE_APPLICATION_CREDENTIALS_BASE64`
- [ ] Commit do `vercel.json` corrigido
- [ ] Push para GitHub
- [ ] Aguardar deploy automático

---

## 🎯 Onde Pegar Cada Variável?

| Variável | Onde Encontrar |
|----------|----------------|
| `DATABASE_URL` | [Neon Dashboard](https://console.neon.tech/) → Connection String |
| Firebase vars | [Firebase Console](https://console.firebase.google.com/) → Project Settings → Config |
| `GOOGLE_CLOUD_PROJECT_ID` | [GCP Console](https://console.cloud.google.com/) → Topo da página |
| Service Account | [GCP IAM](https://console.cloud.google.com/iam-admin/serviceaccounts) → Keys → Download JSON |

---

## ✨ Resultado Esperado

Após configurar tudo:

```
✅ Environment variables configured
✅ Building...
✅ Prisma Client generated
✅ Compiled successfully
✅ Deployment ready
```

**Deploy deve funcionar agora!** 🚀

---

## 📝 Documentação Completa

Para mais detalhes, veja: `CONFIGURAR-VARIAVEIS-VERCEL.md`
