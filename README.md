# nam-presets

Captura de leads para presets NAM. Monolito NestJS (EDA + clean architecture) e landing Next.js.

## Como rodar

```bash
# API — http://localhost:3001
cd api
cp .env.example .env
npm run start:dev

# Web — http://localhost:3000
cd web
cp .env.example .env.local
npm run dev
```

Sem SMTP preenchido no `.env` da API, o e-mail só aparece no console (dry-run). Para entrega real, use Mailtrap, Ethereal ou outro SMTP.

## Fluxo

Formulário → `POST /leads` → `CaptureLeadUseCase` persiste o lead e publica `lead.captured` → `SendInterestEmailHandler` envia o e-mail.

O caso de uso não conhece SMTP. Um canal novo (WhatsApp, etc.) entra como outro handler no mesmo evento.
