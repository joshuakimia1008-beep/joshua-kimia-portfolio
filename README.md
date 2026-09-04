# Joshua Kimia — Portfolio (Next.js + TypeScript)

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Structure

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`)
- `components/` — One component per section (Header, Hero, About, Skills, Projects, Experience, Contact, Footer, Reveal)

## Things to personalize

- Swap the placeholder portrait in `components/Hero.tsx` for a real `<Image />`
- Update the LinkedIn/GitHub links in `components/Contact.tsx` and `components/Footer.tsx`
- Wire the contact form in `components/Contact.tsx` to a real endpoint (e.g. Formspree, or an API route under `app/api/`)
- Add a real CV PDF to `public/` and point the download buttons at it
