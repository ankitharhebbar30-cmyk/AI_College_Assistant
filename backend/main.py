from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

from models.request import ChatRequest

from services.gemini_service import (
    ask_gemini,
    ask_gemini_with_image
)

from services.pdf_service import (
    extract_text_from_pdf
)

import os
import tempfile


# =========================================================
# LOAD ENVIRONMENT
# =========================================================

env_path = Path(__file__).parent / ".env"

load_dotenv(env_path)


# =========================================================
# PDF MEMORY
# =========================================================

pdf_text = ""

pdf_filename = ""


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI()


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message":
            "EduMate AI Backend is running ♡"
    }


# =========================================================
# CHAT
# =========================================================

@app.post("/chat")
def chat(request: ChatRequest):

    global pdf_text
    global pdf_filename

    try:

        question = request.message.strip()


        # -------------------------------------------------
        # IF PDF IS UPLOADED
        # -------------------------------------------------

        if pdf_text:

            prompt = f"""
You are EduMate AI, an AI study assistant.

The student has uploaded a PDF named:

{pdf_filename}

You MUST use the PDF content below when answering
the student's question.

================ PDF CONTENT ================

{pdf_text}

================ END PDF ====================

STUDENT QUESTION:

{question}

Instructions:

1. Answer the student's question using the uploaded PDF.
2. If the answer is clearly present in the PDF, explain it.
3. If the student asks "explain this PDF", give a clear
   overview of the important topics in the PDF.
4. If the answer cannot be found in the PDF, say:

"I couldn't find that information in the uploaded PDF."

5. Do not pretend information is from the PDF if it isn't.
6. Explain difficult concepts in simple student-friendly
   language.
"""

        else:

            prompt = question


        # -------------------------------------------------
        # DEBUG
        # -------------------------------------------------

        print()
        print("======================================")
        print("CHAT REQUEST")
        print("Question:", question)
        print("PDF loaded:", bool(pdf_text))
        print("PDF filename:", pdf_filename)
        print("PDF characters:", len(pdf_text))
        print("======================================")
        print()


        # -------------------------------------------------
        # ASK GEMINI
        # -------------------------------------------------

        reply = ask_gemini(prompt)


        return {

            "reply":
                reply

        }


    except Exception as e:

        print()
        print("======================================")
        print("CHAT ERROR")
        print(type(e).__name__)
        print(str(e))
        print("======================================")
        print()


        return {

            "reply":
                "Backend error: " +
                str(e)

        }


# =========================================================
# PDF UPLOAD
# =========================================================

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...)
):

    global pdf_text
    global pdf_filename


    # -------------------------------------------------
    # CHECK FILE
    # -------------------------------------------------

    if not file.filename:

        return {

            "error":
                "No file selected."

        }


    if not file.filename.lower().endswith(".pdf"):

        return {

            "error":
                "Please upload a PDF file."

        }


    # -------------------------------------------------
    # READ FILE
    # -------------------------------------------------

    contents = await file.read()


    if not contents:

        return {

            "error":
                "The PDF file is empty."

        }


    # -------------------------------------------------
    # TEMPORARY FILE
    # -------------------------------------------------

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    )


    try:

        temp_file.write(contents)

        temp_file.close()


        # -------------------------------------------------
        # EXTRACT TEXT
        # -------------------------------------------------

        extracted_text = extract_text_from_pdf(
            temp_file.name
        )


        # -------------------------------------------------
        # CHECK EXTRACTION
        # -------------------------------------------------

        if not extracted_text:

            return {

                "error":
                    "The PDF was uploaded, but no readable text was found."

            }


        # -------------------------------------------------
        # SAVE PDF IN MEMORY
        # -------------------------------------------------

        pdf_text = extracted_text

        pdf_filename = file.filename


        # -------------------------------------------------
        # DEBUG
        # -------------------------------------------------

        print()
        print("======================================")
        print("PDF UPLOADED")
        print("Filename:", pdf_filename)
        print("Characters:", len(pdf_text))
        print("======================================")
        print()


        return {

            "filename":
                pdf_filename,

            "message":
                "PDF uploaded successfully.",

            "text_length":
                len(pdf_text)

        }


    except Exception as e:

        print()
        print("======================================")
        print("PDF ERROR")
        print(type(e).__name__)
        print(str(e))
        print("======================================")
        print()


        return {

            "error":
                "Failed to process PDF: " +
                str(e)

        }


    finally:

        if os.path.exists(
            temp_file.name
        ):

            os.remove(
                temp_file.name
            )


# =========================================================
# IMAGE QUESTION
# =========================================================

@app.post("/ask-image")
async def ask_image(

    file: UploadFile = File(...),

    question: str = Form(...)

):

    print()
    print("======================================")
    print("IMAGE QUESTION")
    print("Filename:", file.filename)
    print("Content type:", file.content_type)
    print("Question:", question)
    print("======================================")


    # -------------------------------------------------
    # CHECK IMAGE
    # -------------------------------------------------

    allowed_types = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ]


    if file.content_type not in allowed_types:

        return {

            "error":
                "Please upload a JPG, PNG, or WEBP image."

        }


    # -------------------------------------------------
    # READ IMAGE
    # -------------------------------------------------

    contents = await file.read()


    if not contents:

        return {

            "error":
                "The image file is empty."

        }


    # -------------------------------------------------
    # CREATE TEMPORARY IMAGE
    # -------------------------------------------------

    extension = os.path.splitext(
        file.filename
    )[1]


    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=extension
    )


    try:

        temp_file.write(contents)

        temp_file.close()


        print(
            "Image saved temporarily:"
        )

        print(
            temp_file.name
        )


        # -------------------------------------------------
        # SEND IMAGE TO GEMINI
        # -------------------------------------------------

        reply = ask_gemini_with_image(

            question,

            temp_file.name

        )


        print()
        print(
            "✅ IMAGE RESPONSE GENERATED"
        )
        print()


        return {

            "reply":
                reply

        }


    except Exception as e:

        print()
        print("======================================")
        print("❌ IMAGE ERROR")
        print(type(e).__name__)
        print(str(e))
        print("======================================")
        print()


        return {

            "error":
                "Image processing failed: " +
                str(e)

        }


    finally:

        if os.path.exists(
            temp_file.name
        ):

            os.remove(
                temp_file.name
            )


# =========================================================
# CLEAR PDF
# =========================================================

@app.delete("/clear-pdf")
def clear_pdf():

    global pdf_text
    global pdf_filename


    pdf_text = ""

    pdf_filename = ""


    return {

        "message":
            "PDF cleared successfully."

    }