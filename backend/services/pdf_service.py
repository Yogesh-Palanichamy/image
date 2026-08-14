import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


# ============================================================
# SAFE HELPERS
# ============================================================

def safe_number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def safe_text(value):
    if value is None:
        return ""
    return str(value)


def format_confidence(value):
    try:
        number = float(value)

        if number > 1:
            return f"{number:.1f}%"

        return f"{number * 100:.1f}%"

    except (TypeError, ValueError):
        return "N/A"


# ============================================================
# NORMALIZE OBJECTS
# ============================================================

def normalize_objects(objects):

    normalized = []

    # --------------------------------------------------------
    # IMAGE FORMAT
    # objects = [
    #   {"name": "person", "confidence": 0.95}
    # ]
    # --------------------------------------------------------

    if isinstance(objects, list):

        grouped = {}

        for item in objects:

            if not isinstance(item, dict):
                continue

            name = (
                item.get("name")
                or item.get("object")
                or item.get("class")
                or "Unknown"
            )

            confidence = safe_number(
                item.get("confidence", 0)
            )

            if name not in grouped:
                grouped[name] = []

            grouped[name].append(
                confidence
            )

        for name, values in grouped.items():

            normalized.append({

                "name":
                    str(name),

                "count":
                    len(values),

                "confidences":
                    values

            })

        return normalized

    # --------------------------------------------------------
    # VIDEO / LIVE FORMAT
    # objects = {
    #   "person": {
    #       "detections": 10,
    #       "average_confidence": 0.92
    #   }
    # }
    # --------------------------------------------------------

    if isinstance(objects, dict):

        for name, data in objects.items():

            if not isinstance(data, dict):
                data = {}

            count = int(
                safe_number(
                    data.get(
                        "detections",
                        data.get(
                            "totalFrames",
                            data.get(
                                "total_frames",
                                1
                            )
                        )
                    )
                )
            )

            count = max(
                count,
                1
            )

            average = safe_number(
                data.get(
                    "average_confidence",
                    data.get(
                        "averageConfidence",
                        0
                    )
                )
            )

            highest = safe_number(
                data.get(
                    "highest_confidence",
                    data.get(
                        "highestConfidence",
                        average
                    )
                )
            )

            lowest = safe_number(
                data.get(
                    "lowest_confidence",
                    data.get(
                        "lowestConfidence",
                        average
                    )
                )
            )

            values = [
                average
            ] * count

            if values:

                values[0] = highest

                if count > 1:
                    values[-1] = lowest

            normalized.append({

                "name":
                    str(name),

                "count":
                    count,

                "confidences":
                    values

            })

        return normalized

    return []


# ============================================================
# NORMALIZE OBJECT COUNTS
# ============================================================

def normalize_object_counts(
    object_counts,
    objects
):

    result = {}

    # --------------------------------------------------------
    # DICTIONARY
    # --------------------------------------------------------

    if isinstance(
        object_counts,
        dict
    ):

        for name, count in object_counts.items():

            result[
                str(name)
            ] = int(
                safe_number(count)
            )

        return result

    # --------------------------------------------------------
    # LIST
    # --------------------------------------------------------

    if isinstance(
        object_counts,
        list
    ):

        for item in object_counts:

            if isinstance(
                item,
                dict
            ):

                name = (

                    item.get("name")

                    or item.get("object")

                    or item.get("class")

                    or "Unknown"

                )

                count = item.get(

                    "count",

                    item.get(
                        "detections",
                        1
                    )

                )

                result[
                    str(name)
                ] = (

                    result.get(
                        str(name),
                        0
                    )

                    +

                    int(
                        safe_number(count)
                    )

                )

            elif isinstance(
                item,
                str
            ):

                result[item] = (
                    result.get(
                        item,
                        0
                    )
                    + 1
                )
        return result
    # --------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------
    for item in normalize_objects(
        objects
    ):
        result[
            item["name"]
        ] = item["count"]
    return result
# ============================================================
# CREATE PDF REPORT
# ============================================================
def create_pdf_report(
    report_data,
    output_path
):
    if not isinstance(
        report_data,
        dict
    ):
        raise TypeError(
            "report_data must be a dictionary"
        )
    # ========================================================
    # OUTPUT DIRECTORY
    # ========================================================
    output_directory = os.path.dirname(
        output_path
    )
    if output_directory:
        os.makedirs(
            output_directory,
            exist_ok=True
        )
    # ========================================================
    # DOCUMENT
    # ========================================================
    document = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=35,
        leftMargin=35,
        topMargin=35,
        bottomMargin=35
    )
    # ========================================================
    # STYLES
    # ========================================================
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=15
    )
    heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        spaceBefore=12,
        spaceAfter=8
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["BodyText"],
        fontSize=10,
        leading=15,
        spaceAfter=6
    )
    small_style = ParagraphStyle(
        "ReportSmall",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11
    )
    story = []
    # ========================================================
    # TITLE
    # ========================================================
    story.append(
        Paragraph(
            "AI Image & Video Analysis Report",
            title_style
        )
    )
    # ========================================================
    # INPUT TYPE
    # ========================================================
    input_type = report_data.get(
        "input_type",
        "AI Analysis"
    )
    story.append(
        Paragraph(
            f"<b>Analysis Type:</b> "
            f"{safe_text(input_type)}",
            body_style
        )
    )
    story.append(
        Spacer(1, 10)
    )
    # ========================================================
    # AI DESCRIPTION
    # ========================================================
    description = (
        report_data.get(
            "detailed_description"
        )
        or report_data.get(
            "description"
        )
        or report_data.get(
            "caption"
        )
    )
    if description:
        story.append(
            Paragraph(
                "AI Description",
                heading_style
            )
        )
        story.append(
            Paragraph(
                safe_text(description),
                body_style
            )
        )
    # ========================================================
    # CAPTION
    # ========================================================
    caption = report_data.get(
        "caption"
    )
    if caption:
        story.append(
            Paragraph(
                "Caption",
                heading_style
            )
        )
        story.append(
            Paragraph(
                safe_text(caption),
                body_style
            )
        )
    # ========================================================
    # VIDEO INFORMATION
    # ========================================================
    if input_type == "Video":
        story.append(
            Paragraph(
                "Video Information",
                heading_style
            )
        )
        duration_value = safe_number(
            report_data.get(
                "duration",
                0
            )
        )
        fps_value = report_data.get(
            "fps",
            0
        )
        total_frames_value = report_data.get(
            "total_frames",
            0
        )
        processed_frames_value = report_data.get(
            "processed_frames",
            0
        )
        video_rows = [
            [
                "Property",
                "Value"
            ],
            [
                "Duration",
                f"{duration_value:.2f} seconds"
            ],
            [
                "FPS",
                safe_text(
                    fps_value
                )
            ],
            [
                "Total Frames",
                safe_text(
                    total_frames_value
                )
            ],
            [
                "Processed Frames",
                safe_text(
                    processed_frames_value
                )
            ]
        ]
        table = Table(
            video_rows,
            colWidths=[
                160,
                300
            ]
        )
        table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                )
            ])
        )
        story.append(table)
    # ========================================================
    # LIVE CAMERA INFORMATION
    # ========================================================
    if input_type == "Live Camera":
        story.append(
            Paragraph(
                "Live Session Information",
                heading_style
            )
        )
        duration_value = safe_number(
            report_data.get(
                "duration",
                0
            )
        )
        frames_value = report_data.get(
            "frames_analyzed",
            report_data.get(
                "total_frames",
                0
            )
        )
        detections_value = report_data.get(
            "totalDetections",
            report_data.get(
                "total_detections",
                0
            )
        )
        tracks_value = report_data.get(
            "uniqueTracks",
            report_data.get(
                "unique_tracks",
                0
            )
        )
        object_types_value = report_data.get(
            "objectTypes",
            report_data.get(
                "object_types",
                0
            )
        )
        live_rows = [
            [
                "Property",
                "Value"
            ],
            [
                "Duration",
                f"{duration_value:.2f} seconds"
            ],
            [
                "Frames Analyzed",
                safe_text(
                    frames_value
                )
            ],
            [
                "Total Detections",
                safe_text(
                    detections_value
                )
            ],
            [
                "Unique Tracks",
                safe_text(
                    tracks_value
                )
            ],
            [
                "Object Types",
                safe_text(
                    object_types_value
                )
            ]
        ]
        table = Table(
            live_rows,
            colWidths=[
                160,
                300
            ]
        )
        table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                )
            ])
        )
        story.append(table)
    # ========================================================
    # DETECTED OBJECTS
    # ========================================================
    objects = report_data.get(
        "objects",
        []
    )
    normalized_objects = normalize_objects(
        objects
    )
    story.append(
        Paragraph(
            "Detected Objects",
            heading_style
        )
    )
    if normalized_objects:
        object_rows = [
            [
                "Object",
                "Count",
                "Average",
                "Highest",
                "Lowest"
            ]
        ]
        for item in normalized_objects:
            values = item[
                "confidences"
            ]
            average = (
                sum(values) /
                len(values)
                if values
                else 0
            )
            highest = (
                max(values)
                if values
                else 0
            )
            lowest = (
                min(values)
                if values
                else 0
            )
            object_rows.append([
                item[
                    "name"
                ],
                str(
                    item["count"]
                ),
                format_confidence(
                    average
                ),
                format_confidence(
                    highest
                ),
                format_confidence(
                    lowest
                )
            ])
        table = Table(
            object_rows,
            repeatRows=1,
            colWidths=[
                85,
                65,
                110,
                80,
                80
            ]
        )
        table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                )
            ])
        )
        story.append(table)
    else:
        story.append(
            Paragraph(
                "No objects detected.",
                body_style
            )
        )
    # ========================================================
    # OBJECT COUNT
    # ========================================================
    object_counts = normalize_object_counts(
        report_data.get(
            "object_counts",
            {}
        ),
        objects
    )
    if object_counts:
        story.append(
            Paragraph(
                "Object Count",
                heading_style
            )
        )
        count_rows = [
            [
                "Object",
                "Count"
            ]
        ]
        for name, count in object_counts.items():
            count_rows.append([
                str(name),
                str(count)
            ])
        table = Table(
            count_rows,
            repeatRows=1,
            colWidths=[
                250,
                200
            ]
        )
        table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                )
            ])
        )
        story.append(table)
    # ========================================================
    # OCR
    # ========================================================
    ocr_results = report_data.get(
        "text",
        report_data.get(
            "ocr",
            []
        )
    )
    if ocr_results:
        story.append(
            Paragraph(
                "OCR Text",
                heading_style
            )
        )
        if isinstance(
            ocr_results,
            list
        ):
            for item in ocr_results:
                if isinstance(
                    item,
                    dict
                ):
                    text = item.get(
                        "text",
                        ""
                    )
                    confidence = format_confidence(
                        item.get(
                            "confidence",
                            0
                        )
                    )
                    if text:
                        story.append(
                            Paragraph(
                                f"<b>{safe_text(text)}</b> "
                                f"(Confidence: {confidence})",
                                body_style
                            )
                        )
                elif isinstance(
                    item,
                    str
                ):
                    story.append(
                        Paragraph(
                            item,
                            body_style
                        )
                    )
        else:
            story.append(
                Paragraph(
                    safe_text(
                        ocr_results
                    ),
                    body_style
                )
            )
    # ========================================================
    # FACE DETECTION
    # ========================================================
    faces = report_data.get(
        "faces",
        []
    )
    if isinstance(
        faces,
        list
    ):
        story.append(
            Paragraph(
                "Face Detection",
                heading_style
            )
        )
        story.append(
            Paragraph(
                f"Faces detected: "
                f"<b>{len(faces)}</b>",
                body_style
            )
        )
        for index, face in enumerate(
            faces,
            start=1
        ):
            if not isinstance(
                face,
                dict
            ):
                continue
            confidence = format_confidence(
                face.get(
                    "confidence",
                    0
                )
            )
            story.append(
                Paragraph(
                    f"Face {index}: "
                    f"Confidence {confidence}",
                    small_style
                )
            )
    # ========================================================
    # SCENE
    # ========================================================
    scene = report_data.get(
        "scene"
    )
    if scene:
        story.append(
            Paragraph(
                "Scene Recognition",
                heading_style
            )
        )
        story.append(
            Paragraph(
                safe_text(scene),
                body_style
            )
        )
    # ========================================================
    # MOST DETECTED OBJECT
    # ========================================================
    most_detected = (
        report_data.get(
            "mostDetected"
        )
        or report_data.get(
            "most_detected"
        )
    )
    if most_detected:
        most_count = (
            report_data.get("mostDetectedCount")
            or report_data.get("most_detected_count",0)
        )
        story.append(
            Paragraph(
                "Most Observed Object",
                heading_style
            )
        )
        story.append(
            Paragraph(
                f"<b>{safe_text(most_detected)}</b> "
                f"— {most_count} observations",
                body_style
            )
        )
    # ========================================================
    # SESSION ID
    # ========================================================
    session_id = report_data.get("session_id")
    if session_id:
        story.append(
            Paragraph(
                f"Session ID: "
                f"{safe_text(session_id)}",
                small_style
            )
        )
    # ========================================================
    # FOOTER
    # ========================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("Generated by AI Image & Video Processor",small_style))
    # ========================================================
    # BUILD PDF
    # ========================================================
    document.build(story)
    return output_path