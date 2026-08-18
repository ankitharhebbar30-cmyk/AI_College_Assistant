from pypdf import PdfReader
from pdf2image import convert_from_path
import pytesseract


# =========================================================
# TESSERACT
# =========================================================

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# =========================================================
# POPPLER
# =========================================================

POPPLER_PATH = (
    r"C:\Users\ankit\Downloads\Release-26.02.0-0"
    r"\poppler-26.02.0\Library\bin"
)


# =========================================================
# EXTRACT TEXT FROM PDF
# =========================================================

def extract_text_from_pdf(file_path):

    print()
    print("======================================")
    print("PDF TEXT EXTRACTION")
    print("File:", file_path)
    print("======================================")


    # -----------------------------------------------------
    # STEP 1: NORMAL PDF TEXT
    # -----------------------------------------------------

    try:

        reader = PdfReader(file_path)

        print(
            "Number of pages:",
            len(reader.pages)
        )

        text_parts = []


        for page_number, page in enumerate(
            reader.pages,
            start=1
        ):

            page_text = page.extract_text()


            print(
                f"Page {page_number}: "
                f"{len(page_text or '')} characters"
            )


            if page_text and page_text.strip():

                text_parts.append(
                    page_text.strip()
                )


        text = "\n\n".join(
            text_parts
        )


        # -------------------------------------------------
        # IF NORMAL TEXT EXISTS
        # -------------------------------------------------

        if text.strip():

            print("--------------------------------------")
            print(
                "TOTAL EXTRACTED CHARACTERS:",
                len(text)
            )
            print(
                "✅ Normal PDF extraction successful."
            )
            print("--------------------------------------")

            return text


        print("--------------------------------------")
        print(
            "⚠️ No selectable text found."
        )
        print(
            "Starting OCR..."
        )
        print("--------------------------------------")


    except Exception as e:

        print(
            "Normal PDF extraction error:",
            e
        )

        print(
            "Starting OCR..."
        )


    # -----------------------------------------------------
    # STEP 2: OCR
    # -----------------------------------------------------

    try:

        print(
            "Converting PDF pages to images..."
        )


        images = convert_from_path(
            file_path,
            dpi=200,
            poppler_path=POPPLER_PATH
        )


        print(
            "Images created:",
            len(images)
        )


        ocr_text_parts = []


        for page_number, image in enumerate(
            images,
            start=1
        ):

            print(
                f"OCR processing page "
                f"{page_number}/{len(images)}..."
            )


            page_text = pytesseract.image_to_string(
                image,
                lang="eng"
            )


            print(
                f"OCR page {page_number}: "
                f"{len(page_text)} characters"
            )


            if page_text.strip():

                ocr_text_parts.append(
                    page_text.strip()
                )


        ocr_text = "\n\n".join(
            ocr_text_parts
        )


        print("--------------------------------------")
        print(
            "TOTAL OCR CHARACTERS:",
            len(ocr_text)
        )
        print("--------------------------------------")


        if ocr_text.strip():

            print(
                "✅ OCR extraction successful."
            )

        else:

            print(
                "❌ OCR could not extract text."
            )


        print("======================================")
        print()


        return ocr_text


    except Exception as e:

        print()
        print("======================================")
        print("❌ OCR ERROR")
        print(
            type(e).__name__,
            ":",
            str(e)
        )
        print("======================================")
        print()


        return ""


# =========================================================
# SPLIT TEXT INTO CHUNKS
# =========================================================

def split_text_into_chunks(
    text,
    chunk_size=3000
):

    chunks = []


    if not text:

        return chunks


    for i in range(
        0,
        len(text),
        chunk_size
    ):

        chunk = text[
            i:i + chunk_size
        ]


        if chunk.strip():

            chunks.append(
                chunk
            )


    return chunks