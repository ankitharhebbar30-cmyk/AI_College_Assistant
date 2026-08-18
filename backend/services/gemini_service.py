import os
import time

from pathlib import Path

from dotenv import load_dotenv

from google import genai


# ==========================================
# LOAD .ENV
# ==========================================

env_path = Path(__file__).parent.parent / ".env"

load_dotenv(env_path)


# ==========================================
# GEMINI CLIENT
# ==========================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ==========================================
# NORMAL TEXT CHAT
# ==========================================

def ask_gemini(question: str):

    max_attempts = 3

    for attempt in range(max_attempts):

        try:

            response = client.models.generate_content(

                model="gemini-3.6-flash",

                contents=question

            )

            return response.text


        except Exception as e:

            print()
            print("Gemini error:", e)
            print()


            error_text = str(e)


            # ======================================
            # RETRY TEMPORARY 503 ERROR
            # ======================================

            if (
                "503" in error_text
                or "UNAVAILABLE" in error_text
            ):

                if attempt < max_attempts - 1:

                    wait_time = 3 * (
                        attempt + 1
                    )

                    print(
                        "Gemini temporarily unavailable."
                    )

                    print(
                        f"Retrying in {wait_time} seconds..."
                    )

                    time.sleep(
                        wait_time
                    )

                    continue


            # ======================================
            # OTHER ERRORS
            # ======================================

            raise


# ==========================================
# IMAGE + QUESTION
# ==========================================

def ask_gemini_with_image(
    question: str,
    image_path: str
):

    from PIL import Image

    image = Image.open(image_path)


    response = client.models.generate_content(

        model="gemini-3.6-flash",

        contents=[
            image,
            question
        ]

    )


    return response.text