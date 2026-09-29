# 🔑 How to Connect Angel One SmartAPI (સંપૂર્ણ માર્ગદર્શિકા)

આ ડોક્યુમેન્ટમાં **Angel One SmartAPI** ને **F&O Analysis Terminal** સાથે કેવી રીતે જોડવું તેની સ્ટેપ-બાય-સ્ટેપ માહિતી સરળ ગુજરાતી અને English માં આપેલ છે.

---

## 📋 જરૂરી ૪ વિગતો (Required Credentials)

1. **SmartAPI App Key (API Key)**
2. **Angel One Client ID (Client Code)**
3. **Angel One MPIN (PIN)**
4. **TOTP Secret Key (Auto-Login માટે)**

---

## 🛠️ સ્ટેપ-બાય-સ્ટેપ સેટઅપ ગાઈડ

### સ્ટેપ ૧: SmartAPI પોર્ટલમાં લોગિન કરો
1. બ્રાઉઝરમાં આ લિંક ખોલો: 👉 **[https://smartapi.angelbroking.com/](https://smartapi.angelbroking.com/)**
2. તમારા Angel One ના **Client ID** અને **MPIN** વડે લોગિન કરો.

---

### સ્ટેપ ૨: API Key મેળવો (Create App)
1. લોગિન કર્યા પછી ડેશબોર્ડ પર **`+ ADD APP`** (અથવા **`Create an App`**) બટન પર ક્લિક કરો.
2. નીચે મુજબની વિગતો ભરો:
   - **App Name**: `FNO Terminal` (કોઈપણ નામ રાખી શકો છો)
   - **Redirect URL**: `https://www.google.com`
   - **Postback URL**: `https://www.google.com`
   - **Primary Static IP**: 
     - તમારા ઇન્ટરનેટનું Public IPv4 સરનામું.
     - તમારું IP જાણવા ગૂગલ પર સર્ચ કરો `what is my ip` અથવા [whatismyipaddress.com](https://whatismyipaddress.com) ખોલીને 4-ભાગવાળો નંબર કોપી કરી અહીં પેસ્ટ કરો.
   - **Client ID**: તમારો Angel One Client Code દાખલ કરો.
3. **`Create App`** પર ક્લિક કરો.
4. સ્ક્રીન પર એક નવું કાર્ડ બનશે, ત્યાંથી તમારી **API Key** કોપી (Copy) કરી લો.

---

### સ્ટેપ ૩: TOTP Secret Key મેળવો (ઓટોમેટિક Login માટે)
> **નોંધ:** TOTP Secret Key હોવાથી સિસ્ટમ દરરોજ આપોઆપ Login થઈ જશે, તમારે વારંવાર મેન્યુઅલ OTP નાખવાની જરૂર નહીં પડે.

1. SmartAPI પોર્ટલ પર ઉપર મેનુમાં **`Enable TOTP`** પર ક્લિક કરો  
   *(અથવા સીધી લિંક ખોલો: [https://smartapi.angelbroking.com/enable-totp](https://smartapi.angelbroking.com/enable-totp))*
2. તમારો **Client ID** અને **MPIN** નાખી સબમિટ કરો.
3. તમારા મોબાઈલ/ઈમેલ પર આવેલો **OTP** દાખલ કરો.
4. હવે સ્ક્રીન પર એક **QR Code** દેખાશે:
   - તે QR Code ની બરાબર નીચે **અક્ષરો અને આંકડાવાળી એક લાઈન (16 થી 32 અક્ષરોની Secret Key)** લખેલી હશે (દા.ત. `JBSWY3DPEHPK3PXP...`).
   - બાજુમાં રહેલા **Copy** આઈકન પર ક્લિક કરીને તેને સેવ કરી લો.
   - *(સાથે તમારા ફોનમાં Google Authenticator એપ વડે એ QR Code સ્કેન પણ કરી લેવો).*

---

### સ્ટેપ ૪: ટર્મિનલમાં Credentials દાખલ કરો

#### રીત A — ટર્મિનલ UI માંથી (સૌથી સરળ) ⚡
1. બ્રાઉઝરમાં ટર્મિનલ ખોલો: 👉 **`http://localhost:5173/`**
2. ઉપર હેડરમાં રહેલા **`Settings`** બટન (અથવા `SETUP API` વાદળી બેજ) પર ક્લિક કરો.
3. બોક્સમાં આ ૪ વિગતો ભરી દો:
   - **SmartAPI App Key**
   - **Angel Client Code**
   - **Angel MPIN**
   - **TOTP Secret Key**
4. **`Save Credentials & Connect`** પર ક્લિક કરો!
5. હેડરનો બેજ તરત જ ગ્રીન કલરમાં **`● ANGEL ONE LIVE (ID: XXXXX)`** થઈ જશે.

#### રીત B — `.env` ફાઈલ દ્વારા ⚙️
પ્રોજેક્ટના રૂટ ફોલ્ડરમાં રહેલી `.env` ફાઈલ ખોલીને તેમાં તમારી વિગતો ભરી દો:
```env
ANGEL_API_KEY=તમારી_API_Key
ANGEL_CLIENT_CODE=તમારો_Client_ID
ANGEL_PIN=તમારો_4_Digit_MPIN
ANGEL_TOTP_SECRET=તમારી_TOTP_Secret_Key

PORT=8000
HOST=127.0.0.1
```

---

## ❓ સામાન્ય પ્રશ્નો અને ઉકેલ (Troubleshooting)

| પ્રશ્ન / સમસ્યા | ઉકેલ (Solution) |
|---|---|
| **No module named 'logzero'** | ટર્મિનલમાં `pip install logzero websocket-client` કમાન્ડ ચલાવો. |
| **Redirect URL Error** | Redirect URL માં `localhost` ન ચાલશે, ત્યાં `https://www.google.com` લખો. |
| **Market Closed / Weekend** | બજાર બંધ હોય ત્યારે છેલ્લો સાચો ક્લોઝ ભાવ અને હિસ્ટોરિકલ કેન્ડલ્સ દેખાશે. |
| **Credentials ક્યાં સેવ થાય છે?** | તમારી સ્થાનિક `.env` ફાઈલમાં સુરક્ષિત રહે છે. GitHub પર ક્યારેય અપલોડ થતાં નથી. |

---

*હવે તમારું ટર્મિનલ Angel One ના લાઈવ માર્કેટ ડેટા સાથે સફળતાપૂર્વક કનેક્ટ થઈ ગયું છે! 🚀*
