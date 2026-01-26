# 🔧 Como Configurar Variáveis de Ambiente na Vercel

## 🔴 Erro Encontrado

```
Vercel - Falha na implantação
A variável de ambiente "DATABASE_URL" faz referência ao segredo "database_url", que não existe.
```

**Causa:** O `vercel.json` estava tentando referenciar **secrets** (`@database_url`) que não foram criados.

---

## ✅ Solução

**Removi as referências de secrets do `vercel.json`.**

Agora você precisa **adicionar as variáveis diretamente no Dashboard da Vercel**.

---

## 📋 Passo a Passo

### **1. Acesse o Dashboard da Vercel**

1. Vá para: https://vercel.com/dashboard
2. Clique no seu projeto
3. Clique em **Settings** (no topo)
4. No menu lateral, clique em **Environment Variables**

---

### **2. Adicione TODAS as Variáveis de Ambiente**

Clique em **Add New** e adicione **uma por uma**:

#### **📊 Variáveis Obrigatórias:**

| Nome da Variável | Valor | Onde pegar? |
|------------------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:password@host/database?sslmode=require` | Neon Database Dashboard |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sua API Key do Firebase | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `seu-projeto.firebaseapp.com` | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID do projeto Firebase | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `seu-projeto.appspot.com` | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | Firebase Console → Project Settings |
| `GOOGLE_CLOUD_PROJECT_ID` | ID do projeto GCP | Google Cloud Console |
| `GOOGLE_CLOUD_LOCATION` | `us-central1` | Região do GCP (padrão) |
| `GOOGLE_APPLICATION_CREDENTIALS_BASE64` | Credenciais em Base64 | Ver abaixo ⬇️ |

---

### **3. Como Obter as Variáveis**

#### **DATABASE_URL (Neon Database)**

1. Acesse: https://console.neon.tech/
2. Clique no seu projeto
3. Vá em **Dashboard** → **Connection String**
4. Copie a URL completa (formato: `postgresql://...`)

**⚠️ Importante:** Use a connection string com `?sslmode=require` no final!

```
postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require
```

---

#### **Firebase Variables (Firebase Console)**

1. Acesse: https://console.firebase.google.com/
2. Clique no seu projeto
3. Clique no **ícone de engrenagem** (⚙️) → **Project Settings**
4. Role até **Your apps** → Selecione seu app web
5. Copie todas as variáveis de `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",               // ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "projeto.firebaseapp.com",  // ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "meu-projeto",        // ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "projeto.appspot.com",   // ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",  // ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456:web:abc123"     // ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

---

#### **Google Cloud Variables**

1. Acesse: https://console.cloud.google.com/
2. Selecione seu projeto
3. **Project ID** está no topo da página
4. **Location** geralmente é `us-central1` (ou sua região preferida)

---

#### **GOOGLE_APPLICATION_CREDENTIALS_BASE64**

**Opção 1: Se você tem o arquivo JSON localmente**

```bash
# No PowerShell (Windows)
$content = Get-Content -Path "service-account-key.json" -Raw
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))

# No Linux/Mac
cat service-account-key.json | base64 -w 0
```

**Opção 2: Baixar do Google Cloud**

1. Vá em: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Clique na service account que você usa
3. Vá em **Keys** → **Add Key** → **Create New Key**
4. Escolha **JSON** e baixe
5. Converta para Base64 (use comando acima)

---

### **4. Configuração no Dashboard da Vercel**

Para **CADA variável**:

1. Clique em **Add New**
2. Preencha:
   - **Key**: Nome da variável (ex: `DATABASE_URL`)
   - **Value**: Valor da variável
   - **Environments**: Marque **TODOS** os 3:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. Clique em **Save**

**⚠️ IMPORTANTE:** Marque os 3 ambientes para TODAS as variáveis!

---

### **5. Exemplo Visual**

```
┌─────────────────────────────────────────────────┐
│ Add New Environment Variable                    │
├─────────────────────────────────────────────────┤
│ Key:                                            │
│ ┌─────────────────────────────────────────────┐ │
│ │ DATABASE_URL                                 │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Value:                                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ postgresql://user:pass@host/db?sslmode=... │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Environments:                                   │
│ ☑ Production                                    │
│ ☑ Preview                                       │
│ ☑ Development                                   │
│                                                 │
│            [ Cancel ]  [ Save ]                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Variáveis

Marque conforme for adicionando:

- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `GOOGLE_CLOUD_PROJECT_ID`
- [ ] `GOOGLE_CLOUD_LOCATION`
- [ ] `GOOGLE_APPLICATION_CREDENTIALS_BASE64`

---

## 🚀 Após Configurar Todas as Variáveis

### **1. Commit a correção do vercel.json**

```bash
git add vercel.json
git commit -m "fix: remove secret references from vercel.json"
git push origin main
```

### **2. Redeploy Manual (Opcional)**

Se o deploy não iniciar automaticamente:

1. Vá em **Deployments**
2. Clique nos **3 pontos** (⋮) do último deploy
3. Clique em **Redeploy**

### **3. Acompanhe o Build**

O build deve começar e você verá:

```
✓ Prisma Client generated
✓ Compiled successfully
✓ TypeScript check passed
✓ Build completed
```

---

## ⚠️ Troubleshooting

### **Erro: "DATABASE_URL is not defined"**

**Causa:** Variável não foi adicionada ou ambiente não foi marcado.

**Solução:**
1. Verifique se `DATABASE_URL` está na lista
2. Certifique-se que **Production** está marcado
3. Tente redeploy manual

---

### **Erro: "Firebase config missing"**

**Causa:** Variáveis do Firebase não foram adicionadas.

**Solução:**
1. Adicione **TODAS** as variáveis `NEXT_PUBLIC_FIREBASE_*`
2. Certifique-se que os valores estão corretos (sem aspas extras)

---

### **Erro: "Prisma Client generation failed"**

**Causa:** `DATABASE_URL` com formato incorreto.

**Solução:**
1. Verifique se a URL tem `?sslmode=require` no final
2. Teste a conexão localmente primeiro:
   ```bash
   npx prisma db pull
   ```

---

## 📚 Resumo

1. ✅ `vercel.json` corrigido (sem referências a secrets)
2. ✅ Adicione variáveis no Dashboard da Vercel
3. ✅ Marque os 3 ambientes para TODAS
4. ✅ Commit e push
5. ✅ Aguarde deploy automático

**Agora configure as variáveis e o deploy deve funcionar!** 🚀✨
