# 🚀 Deploy Completo - Frontend + Backend

## 📋 Resumo da Configuração

### Backend (Google Cloud)
- **IP**: 35.193.57.27
- **Protocolo**: HTTPS (porta 443)
- **Certificado**: SSL autoassinado
- **API**: https://35.193.57.27/api/

### Frontend (Netlify)
- **Framework**: Angular
- **Deploy**: Automático via Git
- **Proxy**: Redireciona `/api/*` para backend HTTPS

---

## 🎯 Passo a Passo Completo

### 1️⃣ Backend (Já Configurado ✅)

O backend já está rodando com SSL. Para verificar:

```bash
# Na VM
docker ps
curl -Ik https://35.193.57.27/api/
```

### 2️⃣ Frontend - Configurar CORS no Backend

**Na VM**, edite o arquivo `.env`:

```bash
cd ~/bairro-seguro-api
nano .env
```

Adicione a URL do seu site Netlify:

```bash
CORS_ALLOWED_ORIGINS=https://seu-site.netlify.app
```

**Importante**: Substitua `seu-site.netlify.app` pela URL real do Netlify.

Depois, reinicie os containers:

```bash
docker compose restart backend
```

### 3️⃣ Frontend - Deploy no Netlify

**No seu computador local**:

```bash
cd /home/marcelo/Documentos/Meus/bairro-seguro-web

# Commit das alterações
git add .
git commit -m "Configure HTTPS backend connection"
git push origin main
```

O Netlify fará o deploy automaticamente! 🎉

---

## 🧪 Testando a Integração

### 1. Teste o Backend Diretamente

```bash
curl -Ik https://35.193.57.27/api/users/
```

Deve retornar: `HTTP/1.1 200 OK`

### 2. Teste o Frontend

Abra o site no Netlify e verifique o console (F12):

```javascript
// Teste a API
fetch('/api/users/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 🔧 Configurações Opcionais

### Usar Domínio Personalizado (Recomendado)

Se você tiver um domínio (ex: `bairroseguro.com.br`):

#### Backend:
1. Configure DNS: `api.bairroseguro.com.br` → `35.193.57.27`
2. Gere certificado Let's Encrypt:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.bairroseguro.com.br
   ```

#### Frontend:
1. No Netlify: **Domain settings** → **Add custom domain**
2. Configure DNS conforme instruções do Netlify
3. Atualize `.env` no backend:
   ```bash
   CORS_ALLOWED_ORIGINS=https://bairroseguro.com.br
   ```

---

## 📊 Checklist Final

### Backend
- [x] SSL configurado (HTTPS)
- [x] Containers rodando
- [x] Firewall GCP aberto (portas 80, 443)
- [ ] CORS configurado com URL do Netlify
- [ ] `.env` atualizado na VM

### Frontend
- [x] `netlify.toml` usando HTTPS
- [x] `environment.prod.ts` configurado
- [ ] Commit e push feitos
- [ ] Deploy no Netlify completo
- [ ] Teste de integração OK

---

## 🐛 Troubleshooting

### Erro: "CORS policy blocked"

**Solução**: Adicione a URL do Netlify no `.env` do backend:

```bash
# Na VM
cd ~/bairro-seguro-api
nano .env

# Adicione:
CORS_ALLOWED_ORIGINS=https://seu-site.netlify.app

# Reinicie
docker compose restart backend
```

### Erro: "Failed to fetch"

**Verificações**:
1. Backend está rodando? `docker ps`
2. Firewall aberto? Teste: `curl -Ik https://35.193.57.27/api/`
3. `netlify.toml` usa `https://`? (não `http://`)

### Erro: "Mixed Content"

**Causa**: Frontend em HTTPS tentando acessar backend em HTTP

**Solução**: Já resolvido! O `netlify.toml` usa `https://`

---

## 📝 Comandos Úteis

### Backend (VM)
```bash
# Ver logs
docker compose logs -f backend

# Reiniciar
docker compose restart

# Ver status
docker ps

# Testar API
curl -Ik https://35.193.57.27/api/users/
```

### Frontend (Local)
```bash
# Build
npm run build

# Deploy manual
netlify deploy --prod

# Ver logs
netlify logs

# Abrir painel
netlify open
```

---

## 🎯 Próximos Passos

1. **Faça o commit e push** do frontend
2. **Aguarde o deploy** do Netlify (2-3 minutos)
3. **Adicione a URL do Netlify** no `.env` do backend
4. **Teste a integração** completa

---

**✅ Tudo pronto!** Seu sistema está configurado para funcionar com HTTPS! 🚀🔒
