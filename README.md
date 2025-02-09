# Debate Arena

## About the project

Debate Arena is an advanced multi-agent debate system using artificial intelligence. The system allows users to initiate debates on any topic, where AI generates the appropriate debate participants, moderator and monitoring system.

## Technologies

- Backend: Python 3.11, FastAPI, WebSockets, LangGraph, DeepSeek V3 LLM.
- Frontend: Next.js, TypeScript, TailwindCSS
- Communication: WebSocket

## System requirements

- Python 3.11.8
- Node.js 20+
- Docker (optional)
- Installation of required packages (see below)

## Install and run locally

1 Clone the repository:

``` bash
git clone git@github.com:Arputikos/AgentON_2025.git
```

2. In the `backend` folder of the project, copy the `.env-example` file to `.env`.
Add the keys:
- `SECRET_KEY`. 
- `SECRET_KEY_IV`. 
- `API_ENDPOINTS_AUTH_HEADER_KEY`.
- `NEXT_PUBLIC_WEBSOCKET_AUTH_KEY`.

generated in this way:
- for `SECRET_KEY`.

``` bash
node -e "console.log('KEY:', require('crypto').randomBytes(32).toString('hex'))"
```
- for other keys

``` bash    
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

These will be the keys used to encrypt the API keys sent from the frontend to the backend.

3. add the following variables to this file:

``` bash
NEXT_PUBLIC_BACKEND_URL_HTTP=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL_WS=ws://localhost:8000
```

4. copy the `backend/.env` file to the `frontend/.env.local` file.

5. run the backend:

``` bash
cd backend
python -m venv .venv
source .venv/bin/activate # for Linux/MacOS
# or
.venv/Scripts/activate # for Windows
pip install -r requirements.txt
uvicorn main:app
```

6. In a new terminal, run frontend:

``` bash
cd frontend
npm install
npm run dev
```

7 Open the application in a browser at [http://localhost:3000](http://localhost:3000)

## Run on demo environment

Alternatively, simply run the address [agenton-hackathon-2025.vercel.app](https://agenton-hackathon-2025.vercel.app).

## Sample debate topics

- Ideas for making early childhood education more attractive. Debate with Ambrose Kleks, Socrates, Jack Dukaj and Maciej Kawecki.
- Comparison of the most popular programming languages. A debate with Guido van Rossum, Bjarne Stroustrup, James Gosling and Anders Hejlsberg.
- Planning a personal branding strategy as a data scientist (featuring Alex Hormozi and Gary Vee).
- Comparing the iPhone 16 Pro Max with the Galaxy S24 Ultra

## Project structure

The project is divided into two main parts:
- `frontend/` - Next.js application with user interface.
- `backend/` - FastAPI server with debate logic and LLM integration

---

## O projekcie

Debate Arena to zaawansowany system wieloagentowy do prowadzenia debat, wykorzystujący sztuczną inteligencję. System pozwala użytkownikom na inicjowanie debat na dowolny temat, gdzie AI generuje odpowiednich uczestników debaty, moderatora oraz system monitorujący.

## Technologie

- Backend: Python 3.11, FastAPI, WebSockets, LangGraph, DeepSeek V3 LLM
- Frontend: Next.js, TypeScript, TailwindCSS
- Komunikacja: WebSocket

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

2. Skopiuj plik `.env-example` do `backend/.env`.
Ustaw wszystkie potrzebne klucze.
Secrets wygenerujesz według instrukcji poniżej:
- dla `SECRET_KEY`
``` bash
node -e "console.log('KEY:', require('crypto').randomBytes(32).toString('hex'))"
```
- dla `SECRET_KEY_IV`
``` bash    
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
Będą to klucze używane do szyfrowania kluczy API przesyłanych z frontendu na backend.

Auth keys możesz wybrać dowolne, zalecane wygenerowanie managerem haseł. To jedynie dodatkowe zabezpieczenie backendu.

3. Do tego pliku dodaj następujące zmienne:

``` bash
NEXT_PUBLIC_BACKEND_URL_HTTP=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL_WS=ws://localhost:8000
```

4. Plik `backend/.env` skopiuj do pliku `frontend/.env.local`.

5. Uruchom backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # dla Linux/MacOS
# lub
.venv\Scripts\activate  # dla Windows
pip install -r requirements.txt
uvicorn main:app
```

6. W nowym terminalu uruchom frontend:
```bash
cd frontend
npm install
npm run dev
```

7. Otwórz aplikację w przeglądarce pod adresem [http://localhost:3000](http://localhost:3000)

## Uruchomienie na środowisku demo

Alternatywnie poprostu uruchom adres [agenton-hackathon-2025.vercel.app](https://agenton-hackathon-2025.vercel.app)..

## Przykładowe tematy debat

- Pomysły na uatrakcyjnienie edukacji wczesnoszkolnej. Debata z udziałem Ambrożego Kleksa, Sokratesa, Jacka Dukaja i Macieja Kaweckiego.
- Porównanie najbardziej popularnych języków programowania. Debata z udziałem Guido van Rossuma, Bjarne Stroustrupa, Jamesa Goslinga i Andersa Hejlsberga.
- Planowanie strategii personal brandingu jako data scientist (z udziałem Alex Hormozi i Gary Vee)
- Porównanie iPhone 16 Pro Max z Galaxy S24 Ultra

## Struktura projektu

Projekt podzielony jest na dwie główne części:
- `frontend/` - aplikacja Next.js z interfejsem użytkownika
- `backend/` - serwer FastAPI z logiką debaty i integracją LLM
