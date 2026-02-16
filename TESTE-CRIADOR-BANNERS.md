# 🚀 GUIA RÁPIDO - Como Testar o Criador de Banners

## ⚡ Passo 1: Executar Migração (OBRIGATÓRIO)

Abra o terminal na pasta do projeto e execute:

```powershell
npx prisma migrate dev --name add_banner_model
```

Aguarde a confirmação:
```
✔ Generated Prisma Client
✅ Migration applied successfully
```

Em seguida:

```powershell
npx prisma generate
```

---

## 🔥 Passo 2: Reiniciar o Servidor

Se o servidor não reiniciar automaticamente:

```powershell
# Parar (Ctrl+C) e rodar novamente:
npm run dev
```

Aguarde:
```
✓ Ready in 2s
○ Local: http://localhost:3000
```

---

## 🎨 Passo 3: Acessar o Sistema

### 3.1 - Abra o navegador:
```
http://localhost:3000/dashboard
```

### 3.2 - Localize o botão de Admin:
- Procure pelo ícone de **"varinha mágica"** (🪄) no canto superior direito
- OU procure por um botão **"Painel Admin"** / **"Admin"**

### 3.3 - Abra "Gerenciar Produtos":
- Dentro do painel admin
- Clique em **"Gerenciar Produtos"**

---

## 🖼️ Passo 4: Criar Seu Primeiro Banner

### 4.1 - Clique no botão azul:
```
┌──────────────────────────┐
│ 🖼️ Criar Novo Banner     │
└──────────────────────────┘
```

### 4.2 - Preencha o formulário:

1. **Título:** Digite algo como `"Promoção de Verão 2026"`
2. **Tipo de Mídia:** Clique em **"Imagem"** (já vem selecionado)
3. **Proporção:** Escolha uma das 4 opções:
   - 🖥️ **16:9** - Full Horizontal (Desktop)
   - 📱 **1:1** - Quadrado (Feed)
   - 📲 **4:5** - Retrato (70% tela) ← **Recomendado para teste!**
   - 📱 **9:16** - Full Stories (Tela cheia)

4. **Upload:** 
   - Clique na área de upload OU
   - Arraste uma imagem para lá
   - Formatos: JPEG, PNG, WebP, GIF
   - Máximo: 10MB

5. **Link (Opcional):** Pode deixar em branco

6. **Descrição (Opcional):** Pode deixar em branco

### 4.3 - Observe o Preview:
À direita, você verá um **"celular virtual"** mostrando **EXATAMENTE** como o banner ficará cortado no mobile.

### 4.4 - Salvar:
Clique no botão verde **"Salvar Banner"**

### 4.5 - Confirmar:
- Aparecerá uma mensagem: `"✅ Banner criado com sucesso!"`
- O modal fechará automaticamente

---

## ✅ Verificação

### Confirme no banco de dados:
```powershell
npx prisma studio
```

1. Abra: http://localhost:5555
2. Clique em **"Banner"** (tabela nova)
3. Veja seu banner criado com:
   - ✅ Título
   - ✅ Tipo (image)
   - ✅ Proporção (4/5)
   - ✅ URL da mídia (Base64)
   - ✅ orderIndex (0)
   - ✅ isVisible (true)

---

## 🎯 Testando Diferentes Proporções

### Teste 1: Banner Desktop (16:9)
```
Proporção: 🖥️ 16:9
Preview: Banner largo, ótimo para topo de página
Resultado: Ocupará a largura toda, altura menor
```

### Teste 2: Banner Quadrado (1:1)
```
Proporção: 📱 1:1
Preview: Quadrado perfeito, estilo Instagram
Resultado: Fica centralizado, sem distorção
```

### Teste 3: Banner Vertical Médio (4:5) ⭐ RECOMENDADO
```
Proporção: 📲 4:5
Preview: Vertical, ocupa 70% da altura da tela
Resultado: Perfeito para scroll em mobile
```

### Teste 4: Banner Tela Cheia (9:16)
```
Proporção: 📱 9:16
Preview: Vertical completo, estilo Stories/TikTok
Resultado: Ocupa 100% da altura mobile
```

---

## 🔥 Testando Validações

### Teste de Erro 1: Título curto
```
Título: "ab"
Esperado: ❌ "Título deve ter no mínimo 3 caracteres"
```

### Teste de Erro 2: Arquivo grande
```
Upload: arquivo.jpg (15MB)
Esperado: ❌ "Arquivo muito grande. Máximo: 10MB"
```

### Teste de Erro 3: Formato inválido
```
Upload: documento.pdf
Esperado: ❌ "Formato inválido. Use JPEG, PNG, WebP, GIF..."
```

### Teste de Sucesso:
```
✅ Título: "Promoção"
✅ Proporção: 4:5
✅ Arquivo: imagem.jpg (2MB)
Esperado: ✅ "Banner criado com sucesso!"
```

---

## 🐛 Problemas Comuns

### ❌ "Cannot find module '@prisma/client'"
**Solução:**
```powershell
npx prisma generate
```

### ❌ "Table Banner does not exist"
**Solução:**
```powershell
npx prisma migrate dev --name add_banner_model
```

### ❌ "File is too large"
**Solução:** Use uma imagem menor que 10MB

### ❌ Modal não abre
**Solução:** 
1. Verifique o console do navegador (F12)
2. Confirme que clicou no botão "Criar Novo Banner"
3. Limpe o cache do navegador (Ctrl+Shift+R)

### ❌ Preview não aparece
**Solução:**
1. Confirme que selecionou um arquivo
2. Veja se há erro no console
3. Tente outro formato de imagem (JPEG, PNG)

---

## 📸 O que Esperar

### Interface do Modal:
```
┌────────────────────────────────────────────────────┐
│  🖼️ Criar Novo Banner                       [X]    │
│  Proporções rígidas para mobile perfeito           │
├────────────────────────────────────────────────────┤
│                                                    │
│  FORMULÁRIO ←──────────→ CELULAR VIRTUAL          │
│  (Esquerda)               (Direita)               │
│                                                    │
│  • Título                 ┌──────────┐            │
│  • Tipo (Img/Video)       │ 📱 TELA  │            │
│  • Proporção              │          │            │
│  • Upload                 │ ┌──────┐ │            │
│  • Link (opcional)        │ │BANNER│ │            │
│  • Descrição              │ │ AQUI │ │            │
│                           │ └──────┘ │            │
│  [Cancelar] [Salvar]      │          │            │
│                           └──────────┘            │
└────────────────────────────────────────────────────┘
```

### Após Upload:
- ✅ Preview atualiza **instantaneamente**
- ✅ Badge mostra proporção selecionada (ex: "4/5")
- ✅ Imagem fica com **object-cover** (crop inteligente)
- ✅ Informações do arquivo aparecem embaixo

### Após Salvar:
- ✅ Loading spinner (2-3 segundos)
- ✅ Modal fecha
- ✅ Alert: "Banner criado com sucesso!"
- ✅ Dashboard recarrega (se estiver integrado)

---

## 🎉 Checklist de Teste

Marque conforme testa:

- [ ] Migração executada com sucesso
- [ ] Servidor reiniciado
- [ ] Dashboard aberta
- [ ] Modal do Banner Builder apareceu
- [ ] Formulário está visível
- [ ] Preview "Celular Virtual" está visível
- [ ] Upload de imagem funciona
- [ ] Preview atualiza ao fazer upload
- [ ] Trocar aspect ratio muda o preview
- [ ] Botão "Salvar" funciona
- [ ] Loading aparece durante salvamento
- [ ] Modal fecha após sucesso
- [ ] Alert/Toast de sucesso aparece
- [ ] Banner aparece no Prisma Studio

---

## 📞 Se Tudo Der Certo

Você verá:
```
✅ Migração: OK
✅ Servidor: Rodando
✅ Modal: Abre corretamente
✅ Upload: Funciona
✅ Preview: Atualiza em tempo real
✅ Salvamento: Sucesso
✅ Banco: Banner persistido
```

**PARABÉNS!** 🎉 O sistema está funcionando perfeitamente!

---

## 🚀 Próximos Testes (Opcional)

Após confirmar que funciona:

1. **Criar 3 banners diferentes** (um de cada proporção)
2. **Testar com vídeo** (ao invés de imagem)
3. **Adicionar link de destino**
4. **Adicionar descrição**
5. **Testar com arquivo grande** (deve dar erro)
6. **Testar com formato inválido** (deve dar erro)

---

## 📝 Reportar Resultado

Depois de testar, me informe:

✅ **Funcionou perfeitamente** - Podemos avançar para Fase 2 (listar/editar/deletar banners)

OU

❌ **Deu erro** - Copie e cole:
1. Mensagem de erro exata
2. Console do navegador (F12 → Console)
3. Terminal do servidor
4. Em qual passo parou

---

**BOA SORTE! 🚀**
