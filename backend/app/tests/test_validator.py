import io
import unittest

from PIL import Image

from app.core.validator import compress_to_limits, validate_compliance
from app.data.photo_specs import get_spec


class CanadaDigitalPhotoTests(unittest.TestCase):
    def setUp(self):
        self.spec = get_spec("CANADA_PASSPORT")
        dimensions = self.spec["dimensions"]
        self.image = Image.new(
            "RGB",
            (dimensions["width_px"], dimensions["height_px"]),
            "white",
        )

    def test_canada_spec_matches_online_upload_bounds(self):
        self.assertEqual((self.image.width, self.image.height), (1200, 1800))
        self.assertTrue(self.spec["digital_only"])
        self.assertEqual(self.spec["file_requirements"]["min_size_kb"], 200)
        self.assertEqual(self.spec["file_requirements"]["max_size_kb"], 5120)

    def test_encoder_enforces_minimum_size_without_invalidating_jpeg(self):
        requirements = self.spec["file_requirements"]
        encoded, _ = compress_to_limits(
            self.image,
            min_size_kb=requirements["min_size_kb"],
            max_size_kb=requirements["max_size_kb"],
        )

        self.assertGreaterEqual(len(encoded), 200 * 1024)
        self.assertLessEqual(len(encoded), 5120 * 1024)

        decoded = Image.open(io.BytesIO(encoded))
        decoded.verify()

    def test_compliance_uses_final_encoded_file_size(self):
        encoded, _ = compress_to_limits(self.image, min_size_kb=200, max_size_kb=5120)

        result = validate_compliance(self.image, self.spec, file_size_bytes=len(encoded))

        self.assertTrue(result["compliant"])
        self.assertEqual(result["file_size_kb"], 200.0)


if __name__ == "__main__":
    unittest.main()
