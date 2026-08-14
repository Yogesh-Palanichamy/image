from typing import List, Dict


def generate_detailed_description(
    caption: str,
    detections: List[Dict]
) -> str:

    if not caption:
        caption = "No detailed caption was generated."


    objects = [
        item.get("object", "").lower()
        for item in detections
        if item.get("object")
    ]


    unique_objects = list(
        dict.fromkeys(objects)
    )


    sentences = []


    # --------------------------------------------------------
    # Base caption
    # --------------------------------------------------------

    sentences.append(
        caption.strip()
    )


    # --------------------------------------------------------
    # Person + bat
    # --------------------------------------------------------

    has_person = (
        "person" in unique_objects
    )

    has_bat = (
        "baseball bat" in unique_objects
        or "bat" in unique_objects
    )


    if has_person and has_bat:

        sentences.append(
            "A person is visible holding "
            "what appears to be a cricket bat."
        )

        sentences.append(
            "The scene may be related to "
            "a cricket or bat-and-ball activity."
        )


    # --------------------------------------------------------
    # Person + bicycle
    # --------------------------------------------------------

    if (
        has_person
        and "bicycle" in unique_objects
    ):

        sentences.append(
            "A person appears to be near or "
            "using a bicycle."
        )


    # --------------------------------------------------------
    # Person + car
    # --------------------------------------------------------

    if (
        has_person
        and "car" in unique_objects
    ):

        sentences.append(
            "A person and a car are visible "
            "in the scene."
        )


    # --------------------------------------------------------
    # Person + laptop
    # --------------------------------------------------------

    if (
        has_person
        and "laptop" in unique_objects
    ):

        sentences.append(
            "A person appears to be using "
            "or interacting with a laptop."
        )


    # --------------------------------------------------------
    # Multiple people
    # --------------------------------------------------------

    person_count = objects.count(
        "person"
    )

    if person_count > 1:

        sentences.append(
            f"The image contains multiple "
            f"person detections ({person_count} "
            f"detection instances)."
        )


    # --------------------------------------------------------
    # General object context
    # --------------------------------------------------------

    if unique_objects:

        object_text = ", ".join(
            unique_objects
        )

        sentences.append(
            "Detected objects include: "
            + object_text
            + "."
        )


    return " ".join(
        sentences
    )