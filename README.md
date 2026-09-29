# F&O Analysis Terminal (ડેરિવેટિવ એનાલિસિસ ટર્મિનલ)

> **High-Speed F&O Crosshair Scanner with Automated ATM & Option Selection**  
> **[📖 Angel One SmartAPI Setup Guide (એકાઉન્ટ કેવી રીતે જોડવું)](ANGEL_ONE_SETUP.md)**

---

## 🚀 ઝડપી શરૂઆત (Quick Start)

તમે આ ટર્મિનલ નીચેનામાંથી કોઈપણ રીતે બ્રાઉઝરમાં ખોલી શકો છો:

1. **Vite Development Server (Active)**:
   ```
   http://localhost:5173/
   ```
2. **XAMPP Apache (Direct Localhost)**:
   ```
   http://localhost/terminal/
   ```

---

## 🎯 Phase 1 માં બનેલા મુખ્ય ફીચર્સ

### 1. NIFTY 50 & BANKNIFTY Live 5-Min Charts (Top Row)
- TradingView `lightweight-charts` વડે સુપર ફાસ્ટ 60 FPS રિસ્પોન્સિવ કેન્ડલસ્ટિક ચાર્ટ્સ.
- લાઈવ માર્કેટ સિમ્યુલેશન સાથે દર 2 સેકન્ડે ટિક્સ અપડેટ્સ.
- ક્રોસહેર હોવર કરવાથી તે કેન્ડલનો Time, Open, High, Low, Close (OHLC) દેખાશે.

### 2. F&O Movers Panel (Bottom-Left)
- **Top Gainers (+%)** અને **Top Losers (-%)** નું ઓટોમેટિક સોર્ટિંગ:
  $$\% \text{Change} = \frac{\text{LTP} - \text{Previous Close}}{\text{Previous Close}} \times 100$$
- **250ms Debounced Hover System**:
  - કોઈ સ્ટોક (દા.ત. `RELIANCE +3.48%`) પર માઉસ લઈ જતાં જ 250ms પછી ઓટોમેટિક તે સ્ટોક સેન્ટર પેનલમાં લોડ થાય છે.
  - ક્લિક કરવાની જરૂર રહેતી નથી.
  - અનિચ્છનીય ક્લિક્સ કે સ્પીડ-હોવર વખતે ગડબડ ન થાય તે માટે સ્મૂથ visual progress bar આપેલ છે.
- Search Bar વડે કોઈપણ F&O સ્ટોક ઝડપથી શોધી શકાય છે.

### 3. Stock 5-Min Chart & Candle Crosshair Hover (Bottom-Center)
- સ્ટોકનો 5-મિનિટનો કેન્ડલસ્ટિક ચાર્ટ.
- **મુખ્ય વિશેષતા**: માઉસ જે ઐતિહાસિક કેન્ડલ પર જશે, સિસ્ટમ તે ચોક્કસ કેન્ડલનો `Close` ભાવ કેપ્ચર કરશે (નહીં કે માત્ર કરંટ LTP!).
- ઉપર હેડરમાં `CANDLE HOVER: Time | Close | ATM Strike` લાઈવ અપડેટ થશે.

### 4. ATM Strike & CE/PE Calculation Engine
- **ATM Formula**:
  $$\text{ATM Strike} = \text{Round}\left(\frac{\text{Candle Close}}{\text{Strike Interval}}\right) \times \text{Strike Interval}$$
  - દા.ત. `RELIANCE` (Strike Interval ₹20): કેન્ડલ ક્લોઝ ₹1428 $\rightarrow$ Nearest ATM = ₹1420.
  - દા.ત. `TATASTEEL` (Strike Interval ₹2.5): કેન્ડલ ક્લોઝ ₹168 $\rightarrow$ Nearest ATM = ₹170.
- **Directional Selection**:
  - જો સ્ટોક Gainer હોય (% Change > 0) $\rightarrow$ **CALL (CE)**
  - જો સ્ટોક Loser હોય (% Change < 0) $\rightarrow$ **PUT (PE)**

### 5. Option 5-Min Chart Auto-Loading (Bottom-Right)
- જમણી પેનલમાં સંબંધિત ATM સ્ટ્રાઈકનો 5-મિનિટ કેન્ડલસ્ટિક ચાર્ટ આપોઆપ લોડ થશે.
- કેન્ડલ પર માઉસ ફેરવતી વખતે **250ms debounce** રાખેલ છે જેથી ફટાફટ માઉસ સ્ક્રબ કરતી વખતે બિનજરૂરી રેન્ડરિંગ કે API ફ્લડિંગ ન થાય.
- Option Greeks (Delta, IV) અને Anchor Candle Close ડિસ્પ્લે.

### 6. Interactive Gujarati Guide Modal
- હેડરમાં રહેલા **Gujarati Guide** બટન પર ક્લિક કરવાથી સમગ્ર 10-સ્ટેપ આર્કિટેક્ચર ગુજરાતીમાં ડાયાગ્રામ સાથે જોઈ શકાશે.

---

## 📁 પ્રોજેક્ટ ફોલ્ડર સ્ટ્રક્ચર

```
c:\xampp\htdocs\terminal\
├── index.html                     # XAMPP Root entry point
├── assets/                        # Compiled production bundle
├── frontend/                      # React 18 + Vite + TS + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx         # Terminal branding, live clock, index tickers
│   │   │   ├── IndexChart.tsx     # TradingView chart for Nifty & BankNifty
│   │   │   ├── MoversList.tsx     # Gainers & Losers with 250ms hover
│   │   │   ├── StockChart.tsx     # 5M stock candlestick with crosshair close hook
│   │   │   ├── OptionChart.tsx    # 5M ATM option candlestick chart
│   │   │   └── WorkflowExplainerModal.tsx # 10-Step Gujarati guide modal
│   │   ├── data/
│   │   │   ├── fnoUniverse.ts     # F&O stocks with real strike intervals & lots
│   │   │   └── marketSimulator.ts # Realistic 5M candles & option Black-Scholes model
│   │   ├── hooks/
│   │   │   └── useDebounce.ts     # 250ms debounce hooks
│   │   ├── utils/
│   │   │   └── atmEngine.ts       # ATM strike calculation & CE/PE mapper
│   │   ├── App.tsx                # Terminal workspace coordinator
│   │   └── index.css              # Custom dark terminal scrollbars & styles
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                       # Python FastAPI backend (Phase 2 & 3 ready)
│   ├── main.py                    # REST API endpoints (/api/option/atm, etc.)
│   ├── option_mapper.py           # ATM strike calculation engine
│   ├── instrument_master.py       # Local Angel One token caching engine
│   └── requirements.txt           # Python dependencies
│
├── .env.example                   # Template for Angel One SmartAPI credentials
└── README.md
```

---

## 🔮 Roadmap: આગળના Phases

- **Phase 2 (FastAPI Backend)**: Python સર્વર વડે સેકન્ડ દીઠ ડેટા પ્રોસેસિંગ અને ઓટોમેટિક કેલ્ક્યુલેશન.
- **Phase 3 (Angel One SmartAPI)**: WebSocket વડે લાઈવ માર્કેટ ટિક્સ અને Angel One Scrip Master સ્થાનિક રીતે કેશ કરી રિયલ ટાઈમ ઓપ્શન ચાર્ટ્સ મેળવવા.
