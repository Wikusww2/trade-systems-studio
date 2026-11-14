import pytest
from decimal import Decimal
import xml.etree.ElementTree as ET
from app.services.cargowise_xml import cargowise_exporter

def test_cargowise_universal_interchange_schema():
    xml_output = cargowise_exporter.generate_universal_interchange_xml(
        shipment_id="S00001000",
        declaration_id="B00001000",
        port_origin_code="ZADUR",
        port_origin_name="Durban",
        port_dest_code="NLRTM",
        port_dest_name="Rotterdam",
        invoice_amount=Decimal("148500.00"),
        insurance_amount=Decimal("1450.00")
    )
    
    assert "<?xml" in xml_output
    assert "UniversalInterchange" in xml_output
    assert "UniversalShipment" in xml_output
    assert "http://www.cargowise.com/Schemas/Universal/2011/11" in xml_output

    # Parse and assert structure
    root = ET.fromstring(xml_output.encode("utf-8"))
    assert "UniversalInterchange" in root.tag

    # Check DataTarget routing
    xml_str = xml_output
    assert "<Type>ForwardingShipment</Type>" in xml_str
    assert "<Key>S00001000</Key>" in xml_str
    assert "<Type>CustomsDeclaration</Type>" in xml_str
    assert "<Key>B00001000</Key>" in xml_str
    assert "<InvoiceAmount Currency=\"USD\">148500.00</InvoiceAmount>" in xml_str
    assert "<InsuranceAmount Currency=\"USD\">1450.00</InsuranceAmount>" in xml_str
    assert "<HarmonizedCode>8542.31</HarmonizedCode>" in xml_str
    assert "<Value>CLEARED_WITH_RECONCILIATION</Value>" in xml_str
    assert "<Value>19_USC_1592_PROTECTED</Value>" in xml_str

def test_cargowise_decimal_precision_no_float_drift():
    # Pass values requiring exact decimal rounding
    xml_output = cargowise_exporter.generate_universal_interchange_xml(
        invoice_amount=Decimal("123456.78"),
        insurance_amount=Decimal("987.65"),
        line_items=[
            {
                "line_number": 1,
                "description": "Precision Sensor Unit",
                "hts_code": "9031.80",
                "value": Decimal("124444.43")
            }
        ]
    )
    assert "123456.78" in xml_output
    assert "987.65" in xml_output
    assert "124444.43" in xml_output
    # Assert zero scientific notation (e.g. 1.2e+05)
    assert "e+" not in xml_output
    assert "E+" not in xml_output
