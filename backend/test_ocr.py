from services.ocr_service import extract_text


# ============================================================
# OCR TEST IMAGE
# ============================================================

image_path = "uploads/images/ocr_test.png"


# ============================================================
# RUN OCR
# ============================================================

result = extract_text(
    image_path
)


# ============================================================
# DISPLAY RESULT
# ============================================================

print()

print(
    "========== OCR RESULT =========="
)


if not result:

    print(
        "No text detected."
    )

else:

    for item in result:

        print(
            f"Text: {item['text']}"
        )

        print(
            f"Confidence: "
            f"{item['confidence'] * 100:.1f}%"
        )

        print(
            "--------------------------------"
        )


print(
    "================================"
)