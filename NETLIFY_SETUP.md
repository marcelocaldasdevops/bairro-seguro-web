# 🌐 Configuração do Frontend no Netlify

Este guia explica como configurar o frontend Angular no Netlify para se conectar com o backend HTTPS hospedado no Google Cloud.

## 📋 Arquitetura

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Navegador     │ HTTPS   │   Netlify    │ HTTPS   │  GCP Backend    │
│   (usuário)     │────────▶│  (frontend)  │────────▶│ 35.193.57.27    │
└─────────────────┘         └──────────────┘         └─────────────────┘
                                   │
                                   │ Proxy /api/*
                                   │
                                   ▼
                            https://35.193.57.27/api/
```

## ✅ Configurações Já Aplicadas

### 1. **netlify.toml** - Configuração de Proxy

O arquivo `netlify.toml` está configurado para:
- ✅ Fazer proxy de `/api/*` para `https://35.193.57.27/api/*`
- ✅ Usar HTTPS para comunicação com o backend
- ✅ Redirecionar todas as rotas para `index.html` (SPA)

```toml
[[redirects]]
  from = "/api/*"
  to = "https://35.193.57.27/api/:splat"
  status = 200
  force = true
```

### 2. **environment.prod.ts** - URL da API

O ambiente de produção usa o proxy do Netlify:

```typescript
export const environment = {
  production: true,
  apiUrl: '/api'  // Usa proxy do Netlify
};
```

## 🚀 Deploy no Netlify

### Opção 1: Deploy via Git (Recomendado)

1. **Faça commit das alterações**:
   ```bash
   git add .
   git commit -m "Configure HTTPS backend connection"
   git push origin main
   ```

2. **No Netlify**:
   - O deploy será automático se já estiver conectado ao repositório
   - Aguarde o build completar

### Opção 2: Deploy Manual

```bash
# Instale o Netlify CLI (se ainda não tiver)
npm install -g netlify-cli

# Login no Netlify
netlify login

# Build do projeto
npm run build

# Deploy
netlify deploy --prod --dir=dist/frontend
```

## 🔧 Configurações Adicionais no Netlify

### Variáveis de Ambiente (Opcional)

Se quiser tornar a URL da API configurável:

1. No painel do Netlify: **Site settings** → **Environment variables**
2. Adicione:
   ```
   API_URL=https://35.193.57.27
   ```

3. Atualize `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "${API_URL}/api/:splat"
     status = 200
     force = true
   ```

## 🧪 Testando a Conexão

### 1. Teste Local (Antes do Deploy)

```bash
# Instale as dependências
npm install

# Rode em modo de produção local
npm run build
npx http-server dist/frontend -p 8080
```

Acesse: `http://localhost:8080`

### 2. Teste no Netlify (Após Deploy)

Abra o console do navegador (F12) e verifique:

```javascript
// Teste a API
fetch('/api/users/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## 🔍 Troubleshooting

### Erro: "Mixed Content" ou "Blocked by CORS"

**Solução**: Verifique se o backend está configurado corretamente:

1. No backend (`core/settings.py`), confirme:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'https://seu-site.netlify.app',
   ]
   ```

2. Ou use (apenas para desenvolvimento):
   ```python
   CORS_ALLOW_ALL_ORIGINS = True
   ```

### Erro: "Failed to fetch" ou "Network Error"

**Causas possíveis**:
1. Backend não está rodando
2. Firewall do GCP bloqueando porta 443
3. Certificado SSL com problema

**Verificação**:
```bash
# Teste direto o backend
curl -Ik https://35.193.57.27/api/users/

# Deve retornar HTTP/1.1 200 OK
```

### Erro 404 nas rotas do Angular

**Solução**: Já configurado no `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 📊 Checklist de Deploy

Antes de fazer o deploy, verifique:

- [ ] Backend está rodando: `https://35.193.57.27/api/`
- [ ] Firewall GCP permite portas 80 e 443
- [ ] `netlify.toml` aponta para `https://` (não `http://`)
- [ ] `environment.prod.ts` usa `apiUrl: '/api'`
- [ ] CORS configurado no backend
- [ ] Build local funciona: `npm run build`
- [ ] Commit e push feitos

## 🔐 Segurança em Produção

### Backend (Django)

Atualize `.env` na VM:

```bash
DEBUG=False
SECRET_KEY=<gere-uma-chave-segura>
ALLOWED_HOSTS=35.193.57.27,seu-dominio.com
```

### CORS Restritivo

Em `core/settings.py`, substitua:

```python
# De:
CORS_ALLOW_ALL_ORIGINS = True

# Para:
CORS_ALLOWED_ORIGINS = [
    'https://seu-site.netlify.app',
]
```

## 📝 Comandos Úteis

```bash
# Build local
npm run build

# Deploy no Netlify
netlify deploy --prod

# Ver logs do Netlify
netlify logs

# Abrir painel do Netlify
netlify open

# Testar build localmente
npm run build && npx http-server dist/frontend
```

## 🎯 URLs Importantes

- **Frontend (Netlify)**: `https://seu-site.netlify.app`
- **Backend (GCP)**: `https://35.193.57.27`
- **API**: `https://35.193.57.27/api/`
- **Admin**: `https://35.193.57.27/admin/`

## 📚 Próximos Passos (Opcional)

### 1. Domínio Personalizado

- Compre um domínio (ex: `bairroseguro.com.br`)
- Configure no Netlify: **Domain settings** → **Add custom domain**
- Configure DNS para apontar para o Netlify

### 2. SSL no Backend com Let's Encrypt

Substitua o certificado autoassinado por um válido:

```bash
# Na VM
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.bairroseguro.com.br
```

### 3. CI/CD Completo

Configure GitHub Actions para testes automáticos antes do deploy.

---

**✅ Tudo configurado!** Faça o commit e push para o Netlify fazer o deploy automático! 🚀
