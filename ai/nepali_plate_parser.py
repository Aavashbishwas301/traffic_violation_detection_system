"""
Modular Nepal License Plate Recognition, Syntax Parsing & Character Normalization Engine.
Supports:
1. Embossed Latin Standard (e.g. BA 21 CHA 1234, PROV 3 01 023 PA 4567)
2. Devanagari Zonal Standard (e.g. बा २१ च १२३४, को १ प ९८७६)
3. Devanagari Provincial Standard (e.g. प्रदेश ३-०२-००१ च १२३४, बागमती प्रदेश ०२ ०२५ प ९९९९)
4. Two-Line Two-Wheeler Plates (Upper Line: Zone/Lot/Cat, Lower Line: 4-digit serial)
"""

import re
from typing import List, Tuple, Dict, Any, Optional

DEVANAGARI_DIGITS = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
}

LATIN_TO_DEVANAGARI_DIGITS = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
}

# Standard Zonal Prefixes
ZONAL_DEVANAGARI = [
    'बा', 'को', 'गं', 'लु', 'क', 'सु', 'मे', 'से', 'भे', 'रा', 'ध', 'जा', 'सा', 'न', 'म'
]

ZONAL_LATIN = [
    'BA', 'KO', 'GA', 'LU', 'KA', 'SU', 'ME', 'SE', 'BHE', 'RA', 'DHA', 'JA', 'SA', 'NA', 'MA'
]

# Vehicle Categories (Nepali DoTM)
CATEGORY_DEVANAGARI = ['च', 'प', 'ख', 'क', 'ज', 'बा', 'झ', 'ग', 'घ', 'त', 'थ', 'द', 'ध', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह']
CATEGORY_LATIN = ['CHA', 'PA', 'KHA', 'KA', 'JA', 'BA', 'JHA', 'GA', 'GHA', 'TA', 'THA', 'DA', 'DHA', 'YA', 'RA', 'LA', 'VA', 'SA', 'HA']


def normalize_devanagari_digits(text: str) -> str:
    """Converts Devanagari numerals (०-९) to Latin standard digits (0-9)."""
    if not text:
        return ""
    result = []
    for ch in text:
        result.append(DEVANAGARI_DIGITS.get(ch, ch))
    return "".join(result)


def to_devanagari_digits(text: str) -> str:
    """Converts Latin standard digits (0-9) to Devanagari numerals (०-९)."""
    if not text:
        return ""
    result = []
    for ch in text:
        result.append(LATIN_TO_DEVANAGARI_DIGITS.get(ch, ch))
    return "".join(result)


def clean_plate_characters(text: str) -> str:
    """Retains legal characters for Nepal number plates (Latin, Devanagari, Digits, Spaces, Hyphens)."""
    if not text:
        return ""
    cleaned = re.sub(r'[^A-Z0-9\u0900-\u097F\s\-]', '', text.upper())
    return " ".join(cleaned.split())


def fix_ocr_glyph_confusions(text: str) -> str:
    """
    Resolves common OCR optical confusions:
    - Replace 'O'/'o' with '0' when surrounded by numbers.
    - Replace 'I'/'l' with '1' when surrounded by numbers.
    - Replace 'Z' with '2' when in pure number segments.
    """
    if not text:
        return ""

    tokens = text.split()
    fixed_tokens = []

    for token in tokens:
        # If token is mostly digits with a few confused letters
        digits_count = sum(1 for c in token if c.isdigit() or c in DEVANAGARI_DIGITS)
        if len(token) >= 3 and digits_count >= len(token) - 2:
            # Fix inside numeric token
            t = token.replace('O', '0').replace('o', '0').replace('I', '1').replace('l', '1').replace('Z', '2').replace('S', '5').replace('B', '8')
            fixed_tokens.append(t)
        else:
            fixed_tokens.append(token)

    return " ".join(fixed_tokens)


class NepalPlateValidator:
    """
    Modular Validator and Syntax Normalizer for Nepal License Plates.
    """

    @staticmethod
    def parse_embossed_latin(text: str) -> Optional[Dict[str, Any]]:
        """
        Validates Embossed Latin Plates:
        Examples: 'BA 21 CHA 1234', 'PROV 3 PA 5678', '01 023 PA 4567'
        """
        norm_text = normalize_devanagari_digits(text)
        
        # Regex for Embossed Standard
        pattern = r'(?:(?:PROV|PROVINCE)\s*(\d{1,2})|([A-Z]{2,3}))?\s*(\d{1,3})\s*([A-Z]{1,3})\s*(\d{3,4})'
        match = re.search(pattern, norm_text)
        
        if match:
            prov_num, zonal_code, lot_num, cat_code, serial_num = match.groups()
            
            # Format normalized display
            prefix = ""
            if prov_num:
                prefix = f"PROV {prov_num} "
            elif zonal_code:
                prefix = f"{zonal_code} "
                
            formatted = f"{prefix}{lot_num} {cat_code} {serial_num}".strip()
            search_key = re.sub(r'[^A-Z0-9]', '', formatted)
            
            return {
                "plate_format": "EMBOSSED_LATIN",
                "formatted_display": formatted,
                "normalized_plate": search_key,
                "is_valid_syntax": True
            }
        return None

    @staticmethod
    def parse_devanagari_zonal(text: str) -> Optional[Dict[str, Any]]:
        """
        Validates Devanagari Zonal Plates:
        Examples: 'बा २१ च १२३४', 'को १ प ९८७६', 'मे १ ख ३४५६'
        """
        pattern = r'([बा|को|गं|लु|क|सु|मे|से|भे|रा|ध|जा|सा|न|म]+)\s*([०-९\d]{1,3})\s*([चपखकजबाझगघतथदधयरलवशषसह]+)\s*([०-९\d]{3,4})'
        match = re.search(pattern, text)
        
        if match:
            zone, lot, cat, serial = match.groups()
            formatted = f"{zone} {lot} {cat} {serial}"
            
            # Create a normalized Latin search key for database indexing
            lat_lot = normalize_devanagari_digits(lot)
            lat_serial = normalize_devanagari_digits(serial)
            search_key = re.sub(r'[^A-Z0-9\u0900-\u097F]', '', formatted)
            
            return {
                "plate_format": "DEVANAGARI_ZONAL",
                "formatted_display": formatted,
                "normalized_plate": search_key,
                "is_valid_syntax": True
            }
        return None

    @staticmethod
    def parse_devanagari_provincial(text: str) -> Optional[Dict[str, Any]]:
        """
        Validates Devanagari Provincial Plates:
        Examples: 'प्रदेश ३-०२-००१ च १२३४', 'बागमती प्रदेश ०२ ०२५ प ९९९९'
        """
        pattern = r'(प्रदेश\s*[०-९\d\-]+|[\u0900-\u097F]+\s*प्रदेश)\s*([०-९\d\s\-]+)?\s*([चपखकजबाझगघतथदधयरलवशषसह]+)\s*([०-९\d]{3,4})'
        match = re.search(pattern, text)
        
        if match:
            prov, lot, cat, serial = match.groups()
            lot_clean = lot.strip() if lot else ""
            formatted = f"{prov} {lot_clean} {cat} {serial}".strip()
            search_key = re.sub(r'[^A-Z0-9\u0900-\u097F]', '', formatted)
            
            return {
                "plate_format": "DEVANAGARI_PROVINCIAL",
                "formatted_display": formatted,
                "normalized_plate": search_key,
                "is_valid_syntax": True
            }
        return None


def parse_and_validate_nepali_plate(ocr_results: List[Tuple[Any, str, float]]) -> Dict[str, Any]:
    """
    Full pipeline to parse, sort multi-line boxes, normalize characters, and validate syntax.
    """
    if not ocr_results:
        return {
            "raw_ocr": "",
            "normalized_plate": "Unknown",
            "formatted_display": "Unknown",
            "plate_format": "UNKNOWN",
            "confidence": 0.0,
            "is_valid_syntax": False,
            "requires_review": True,
            "review_reason": "No OCR text detected"
        }

    # 1. Multi-line vertical sorting: Top lines appear before bottom lines
    sorted_lines = sorted(ocr_results, key=lambda item: item[0][0][1])

    raw_tokens = []
    confidences = []

    for bbox, text, prob in sorted_lines:
        t = text.strip()
        if t:
            raw_tokens.append(t)
            confidences.append(prob)

    if not raw_tokens:
        return {
            "raw_ocr": "",
            "normalized_plate": "Unknown",
            "formatted_display": "Unknown",
            "plate_format": "UNKNOWN",
            "confidence": 0.0,
            "is_valid_syntax": False,
            "requires_review": True,
            "review_reason": "Empty OCR output"
        }

    raw_text = " ".join(raw_tokens)
    avg_confidence = round(sum(confidences) / len(confidences), 4)

    # 2. Character cleaning & glyph confusion resolution
    cleaned_text = clean_plate_characters(raw_text)
    fixed_text = fix_ocr_glyph_confusions(cleaned_text)

    # 3. Format Validation against Nepal Standards
    parsed = (
        NepalPlateValidator.parse_embossed_latin(fixed_text) or
        NepalPlateValidator.parse_devanagari_zonal(fixed_text) or
        NepalPlateValidator.parse_devanagari_provincial(fixed_text)
    )

    if parsed:
        final_conf = min(1.0, round(float(avg_confidence) + 0.15, 4))
        is_low_conf = bool(final_conf < 0.70)
        
        return {
            "raw_ocr": str(raw_text),
            "normalized_plate": str(parsed["normalized_plate"]),
            "formatted_display": str(parsed["formatted_display"]),
            "plate_format": str(parsed["plate_format"]),
            "confidence": float(final_conf),
            "is_valid_syntax": bool(parsed["is_valid_syntax"]),
            "requires_review": bool(is_low_conf),
            "review_reason": "Low OCR confidence on plate" if is_low_conf else None
        }

    # Fallback: Generic Alphanumeric text if valid syntax match was not achieved
    norm_digits = normalize_devanagari_digits(fixed_text)
    clean_alpha = re.sub(r'[^A-Z0-9\u0900-\u097F]', '', norm_digits)

    if len(clean_alpha) >= 4:
        return {
            "raw_ocr": str(raw_text),
            "normalized_plate": str(clean_alpha),
            "formatted_display": str(fixed_text),
            "plate_format": "GENERIC_ALPHANUMERIC",
            "confidence": float(avg_confidence),
            "is_valid_syntax": False,
            "requires_review": True,
            "review_reason": "Non-standard plate syntax / Manual verification recommended"
        }

    return {
        "raw_ocr": str(raw_text),
        "normalized_plate": "Unknown",
        "formatted_display": "Unknown",
        "plate_format": "UNKNOWN",
        "confidence": float(avg_confidence),
        "is_valid_syntax": False,
        "requires_review": True,
        "review_reason": "Incomplete plate characters"
    }
