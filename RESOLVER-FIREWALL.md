# 🔥 Como Resolver Problema de Firewall - Porta 3000

## ✅ Diagnóstico

O servidor está rodando corretamente e escutando em `0.0.0.0:3000`, mas o firewall do Windows pode estar bloqueando conexões externas.

## 🔧 Solução Rápida (Recomendado)

### Opção 1: Script Automático (Execute como Administrador)

1. **Feche o PowerShell atual**
2. **Abra um NOVO PowerShell como Administrador:**
   - Clique com botão direito no PowerShell
   - Selecione "Executar como administrador"
3. **Navegue até a pasta do projeto:**
   ```powershell
   cd "C:\Users\Bruno\mapa-para-codar-com-velocidade-fun-o"
   ```
4. **Execute o script:**
   ```powershell
   .\fix-firewall.ps1
   ```

### Opção 2: Manual (Interface Gráfica)

1. **Abra o Firewall do Windows:**
   - Pressione `Win + R`
   - Digite: `wf.msc`
   - Pressione Enter

2. **Crie uma nova regra:**
   - Clique em "Regras de Entrada" (Inbound Rules)
   - Clique em "Nova Regra..." (New Rule...)
   - Selecione "Porta" → Next
   - Selecione "TCP"
   - Digite `3000` na porta específica → Next
   - Selecione "Permitir a conexão" → Next
   - Marque todas as opções (Domain, Private, Public) → Next
   - Nome: "Next.js Dev Server Port 3000" → Finish

3. **Teste novamente no celular**

### Opção 3: Comando PowerShell (Como Administrador)

```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## 🧪 Testar Conectividade

Execute o script de teste:

```powershell
.\test-connection.ps1
```

Isso vai verificar se:
- O servidor está respondendo localmente
- O servidor está acessível pelo IP da rede

## 📱 Verificações no Celular

1. **Certifique-se de que o celular está na mesma rede WiFi**
   - Verifique o IP do celular nas configurações WiFi
   - Deve começar com `192.168.15.x` (mesmo que o computador)

2. **Teste no navegador do celular:**
   - Abra o Chrome/Safari
   - Digite: `http://192.168.15.24:3000`
   - Deve carregar o app

3. **Se ainda não funcionar:**
   - Verifique se há antivírus bloqueando
   - Tente desabilitar temporariamente o firewall para testar
   - Verifique se o roteador não está bloqueando comunicação entre dispositivos

## 🔍 Verificar se Está Funcionando

No PowerShell (normal, não precisa ser admin):

```powershell
.\test-connection.ps1
```

Se mostrar "OK - Servidor está acessível", está funcionando!

## ⚠️ Importante

- O script `fix-firewall.ps1` precisa ser executado **como Administrador**
- Após configurar o firewall, não precisa fazer novamente
- A regra permanece ativa mesmo após reiniciar o computador
