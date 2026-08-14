from services.face_service import detect_faces


# ============================================================
# TEST IMAGE
# ============================================================

image_path = "uploads/images/ocr_test.png"


# ============================================================
# RUN FACE DETECTION
# ============================================================

result = detect_faces(image_path)


# ============================================================
# DISPLAY RESULT
# ============================================================

print()
print("========== FACE DETECTION ==========")


if not result:

    print("No faces detected.")

else:

    print(
        f"Faces detected: {len(result)}"
    )

    for index, face in enumerate(
        result,
        start=1
    ):

        print()
        print(f"Face {index}")

        print(
            f"X: {face['xmin']}"
        )

        print(
            f"Y: {face['ymin']}"
        )

        print(
            f"Width: {face['width']}"
        )

        print(
            f"Height: {face['height']}"
        )

        print(
            "Confidence:",
            f"{face['confidence'] * 100:.1f}%"
        )


print("====================================")