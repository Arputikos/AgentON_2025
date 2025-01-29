# Debate Arena

## O projekcie

Debate Arena to zaawansowany system wieloagentowy do prowadzenia debat, wykorzystujący sztuczną inteligencję. System pozwala użytkownikom na inicjowanie debat na dowolny temat, gdzie AI generuje odpowiednich uczestników debaty, moderatora oraz system monitorujący.

## Technologie

- Backend: Python 3.11, FastAPI, WebSockets, LangGraph, DeepSeek V3 LLM
- Frontend: Next.js, TypeScript, TailwindCSS
- Komunikacja: WebSocket
- Konteneryzacja: Docker (w przygotowaniu)

## Wymagania systemowe

- Python 3.11.8
- Node.js 20+
- Docker (opcjonalnie)
- instalacja wymaganych pakietów (patrz poniżej)

## Instalacja i uruchomienie lokalne

1. Sklonuj repozytorium:

```bash
git clone git@github.com:Arputikos/AgentON_2025.git
```

2. W folderze backend projektu skopiuj plik `.env-example` do `.env`.
Dodaj klucze `SECRET_KEY` oraz `SECRET_KEY_IV` wygenerowane w ten sposób:
```
node -e "console.log('KEY:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('IV :', require('crypto').randomBytes(16).toString('hex'))"
```
Będą to klucze używane do szyfrowania kluczy API przesyłanych z frontendu na backend.

3. Uruchom backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # dla Linux/MacOS
# lub
.venv\Scripts\activate  # dla Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

4. W nowym terminalu uruchom frontend:
```bash
cd frontend
npm install
npm run dev
```

5. Otwórz aplikację w przeglądarce pod adresem [http://localhost:3000](http://localhost:3000)

## Instalacja i uruchomienie za pomocą Dockera

(w przygotowaniu)

## Uruchomienie na środowisku demo

(w przygotowaniu)

## Przykładowe tematy debat

- Pomysły na uatrakcyjnienie edukacji wczesnoszkolnej. Debata z udziałem Ambrożego Kleksa, Sokratesa, Jacka Dukaja i Macieja Kaweckiego.
- Porównanie najbardziej popularnych języków programowania. Debata z udziałem Guido van Rossuma, Bjarne Stroustrupa, Jamesa Goslinga i Andersa Hejlsberga.
- Planowanie strategii personal brandingu jako data scientist (z udziałem Alex Hormozi i Gary Vee)
- Porównanie iPhone 16 Pro Max z Galaxy S24 Ultra

## Struktura projektu

Projekt podzielony jest na dwie główne części:
- `frontend/` - aplikacja Next.js z interfejsem użytkownika
- `backend/` - serwer FastAPI z logiką debaty i integracją LLM
