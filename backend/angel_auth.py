"""
Angel One SmartAPI Authentication Manager
Handles automatic login using API Key, Client Code, MPIN, and TOTP Secret.
"""
import os
import pyotp
from dotenv import load_dotenv
from typing import Optional, Dict, Any

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class AngelAuthManager:
    def __init__(self):
        self.smart_api = None
        self.auth_token = None
        self.refresh_token = None
        self.feed_token = None
        self.is_connected = False
        self.last_error = None
        self.client_code = None

    def get_credentials(self) -> Dict[str, str]:
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
        load_dotenv(env_path, override=True)
        return {
            "api_key": os.getenv("ANGEL_API_KEY", "").strip(),
            "client_code": os.getenv("ANGEL_CLIENT_CODE", "").strip(),
            "pin": os.getenv("ANGEL_PIN", "").strip(),
            "totp_secret": os.getenv("ANGEL_TOTP_SECRET", "").strip(),
        }

    def save_credentials(self, api_key: str, client_code: str, pin: str, totp_secret: str):
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
        content = f"""# Angel One SmartAPI Credentials
ANGEL_API_KEY={api_key.strip()}
ANGEL_CLIENT_CODE={client_code.strip()}
ANGEL_PIN={pin.strip()}
ANGEL_TOTP_SECRET={totp_secret.strip()}

PORT=8000
HOST=127.0.0.1
"""
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(content)
        load_dotenv(env_path, override=True)

    def login(self) -> bool:
        """
        Generates session with Angel One SmartAPI using TOTP
        """
        creds = self.get_credentials()
        api_key = creds["api_key"]
        client_code = creds["client_code"]
        pin = creds["pin"]
        totp_secret = creds["totp_secret"]

        if not all([api_key, client_code, pin, totp_secret]):
            self.last_error = "Missing Angel One credentials in .env or settings"
            self.is_connected = False
            return False

        try:
            from SmartApi import SmartConnect

            self.smart_api = SmartConnect(api_key=api_key)
            totp = pyotp.TOTP(totp_secret).now()

            data = self.smart_api.generateSession(client_code, pin, totp)
            if data and data.get("status") is True:
                self.auth_token = data["data"]["jwtToken"]
                self.refresh_token = data["data"]["refreshToken"]
                self.feed_token = self.smart_api.getfeedToken()
                self.client_code = client_code
                self.is_connected = True
                self.last_error = None
                print(f"[AngelAuth] Successfully logged in for Client Code: {client_code}")
                return True
            else:
                msg = data.get("message", "Unknown authentication error") if data else "Empty response"
                self.last_error = msg
                self.is_connected = False
                print(f"[AngelAuth] Login failed: {msg}")
                return False
        except Exception as e:
            self.last_error = str(e)
            self.is_connected = False
            print(f"[AngelAuth] Exception during login: {e}")
            return False

    def get_status(self) -> Dict[str, Any]:
        creds = self.get_credentials()
        has_creds = bool(creds["api_key"] and creds["client_code"] and creds["pin"] and creds["totp_secret"])
        return {
            "is_connected": self.is_connected,
            "has_credentials": has_creds,
            "client_code": creds["client_code"] if has_creds else "",
            "last_error": self.last_error,
        }

auth_manager = AngelAuthManager()
