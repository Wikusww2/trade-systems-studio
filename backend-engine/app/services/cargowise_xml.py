import hashlib
import xml.etree.ElementTree as ET
from decimal import Decimal
from typing import Any, Dict, List, Optional
from xml.dom import minidom

from pydantic import BaseModel

from app.core.config import settings


class CargoWiseShipmentData(BaseModel):
    shipment_id: str = "S00001000"
    declaration_id: str = "B00001000"
    port_origin_code: str = "ZADUR"
    port_origin_name: str = "Durban"
    port_dest_code: str = "NLRTM"
    port_dest_name: str = "Rotterdam"
    invoice_number: str = "CI-2026-01"
    incoterm: str = "CIF"
    invoice_amount: Decimal = Decimal("148500.00")
    insurance_amount: Decimal = Decimal("1450.00")

class CargoWiseExportService:
    """
    Generates schema-compliant CargoWise One eAdaptor UniversalShipment XML payloads.
    Adheres strictly to http://www.cargowise.com/Schemas/Universal/2011/11 (version 1.1).
    Enforces deterministic Python Decimal arithmetic with zero floating-point drift.
    """

    def generate_universal_interchange_xml(
        self,
        shipment_id: str = "S00001000",
        declaration_id: str = "B00001000",
        port_origin_code: str = "ZADUR",
        port_origin_name: str = "Durban",
        port_dest_code: str = "NLRTM",
        port_dest_name: str = "Rotterdam",
        consignor_code: str = "TSTORGCHC",
        invoice_number: str = "CI-2026-01",
        incoterm: str = "CIF",
        invoice_amount: Decimal = Decimal("148500.00"),
        insurance_amount: Decimal = Decimal("1450.00"),
        line_items: Optional[List[Dict[str, Any]]] = None,
        audit_status: str = "CLEARED_WITH_RECONCILIATION",
        penalty_status: str = "19_USC_1592_PROTECTED",
        company_code: Optional[str] = None,
        enterprise_id: Optional[str] = None,
        server_id: Optional[str] = None,
    ) -> str:
        if line_items is None:
            line_items = [
                {
                    "line_number": 1,
                    "description": "Industrial Controller Assembly with Integrated Circuitry",
                    "hts_code": "8542.31",
                    "value": Decimal("149950.00")
                }
            ]

        # Corridor jurisdiction check (H2):
        # 19 U.S.C. § 1592 only applies to US import corridors (destination in US e.g. USLAX).
        # Non-US destinations (e.g. NLRTM Rotterdam in the EU) are subject to EU UCC, not US CBP penalties.
        # Never flag 19_USC_1592_PROTECTED on non-US shipments.
        is_us_corridor = port_dest_code.upper().startswith("US")
        if not is_us_corridor and penalty_status == "19_USC_1592_PROTECTED":
            penalty_status = "EU_UCC_COMPLIANT"

        # Root UniversalInterchange Envelope
        root = ET.Element(
            "UniversalInterchange",
            xmlns="http://www.cargowise.com/Schemas/Universal/2011/11",
            version="1.1"
        )

        # Content-addressed CorrelationID (M4)
        corr_seed = f"{shipment_id}:{declaration_id}:{port_origin_code}:{port_dest_code}:{invoice_amount}"
        correlation_id = f"CW-{hashlib.sha256(corr_seed.encode('utf-8')).hexdigest()[:16].upper()}"

        header = ET.SubElement(root, "Header")
        ET.SubElement(header, "SenderID").text = "TRADESYSTEMS_PREAUDIT"
        ET.SubElement(header, "RecipientID").text = "CW1_EADAPTOR_PRD"
        ET.SubElement(header, "CorrelationID").text = correlation_id

        body = ET.SubElement(root, "Body")
        universal_shipment = ET.SubElement(
            body,
            "UniversalShipment",
            xmlns="http://www.cargowise.com/Schemas/Universal/2011/11",
            version="1.1"
        )

        shipment = ET.SubElement(universal_shipment, "Shipment")

        # Routing & Context
        data_context = ET.SubElement(shipment, "DataContext")
        data_target_collection = ET.SubElement(data_context, "DataTargetCollection")
        
        target_fwd = ET.SubElement(data_target_collection, "DataTarget")
        ET.SubElement(target_fwd, "Type").text = "ForwardingShipment"
        ET.SubElement(target_fwd, "Key").text = shipment_id

        target_cus = ET.SubElement(data_target_collection, "DataTarget")
        ET.SubElement(target_cus, "Type").text = "CustomsDeclaration"
        ET.SubElement(target_cus, "Key").text = declaration_id

        effective_company = company_code or getattr(settings, "CARGOWISE_COMPANY_CODE", "CPH")
        effective_enterprise = enterprise_id or getattr(settings, "CARGOWISE_ENTERPRISE_ID", "TRN")
        effective_server = server_id or getattr(settings, "CARGOWISE_SERVER_ID", "A04")

        company = ET.SubElement(data_context, "Company")
        ET.SubElement(company, "Code").text = effective_company
        ET.SubElement(data_context, "EnterpriseID").text = effective_enterprise
        ET.SubElement(data_context, "ServerID").text = effective_server

        # Ports
        port_origin = ET.SubElement(shipment, "PortOfOrigin")
        ET.SubElement(port_origin, "Code").text = port_origin_code
        ET.SubElement(port_origin, "Name").text = port_origin_name

        port_dest = ET.SubElement(shipment, "PortOfDestination")
        ET.SubElement(port_dest, "Code").text = port_dest_code
        ET.SubElement(port_dest, "Name").text = port_dest_name

        # Organization
        org_address_collection = ET.SubElement(shipment, "OrganizationAddressCollection")
        org_address = ET.SubElement(org_address_collection, "OrganizationAddress")
        ET.SubElement(org_address, "AddressType").text = "ConsignorDocumentaryAddress"
        ET.SubElement(org_address, "OrganizationCode").text = consignor_code

        # Commercial Invoice with Reconciled CIF Line Items
        ci_collection = ET.SubElement(shipment, "CommercialInvoiceCollection")
        ci = ET.SubElement(ci_collection, "CommercialInvoice")
        ET.SubElement(ci, "InvoiceNumber").text = invoice_number
        
        incoterm_el = ET.SubElement(ci, "Incoterm")
        ET.SubElement(incoterm_el, "Code").text = incoterm

        ET.SubElement(ci, "InvoiceAmount", Currency="USD").text = f"{invoice_amount:.2f}"
        ET.SubElement(ci, "InsuranceAmount", Currency="USD").text = f"{insurance_amount:.2f}"

        lines_collection = ET.SubElement(ci, "CommercialInvoiceLineCollection")
        for item in line_items:
            line_el = ET.SubElement(lines_collection, "CommercialInvoiceLine")
            ET.SubElement(line_el, "LineNumber").text = str(item.get("line_number", 1))
            ET.SubElement(line_el, "Description").text = str(item.get("description", ""))
            ET.SubElement(line_el, "HarmonizedCode").text = str(item.get("hts_code", "8542.31"))
            val = Decimal(str(item.get("value", "0.00")))
            ET.SubElement(line_el, "CustomsValue", Currency="USD").text = f"{val:.2f}"

        # Customized Audit Telemetry
        custom_fields = ET.SubElement(shipment, "CustomizedFieldCollection")
        
        cf_audit = ET.SubElement(custom_fields, "CustomizedField")
        ET.SubElement(cf_audit, "Key").text = "PreAuditVerificationStatus"
        ET.SubElement(cf_audit, "DataType").text = "String"
        ET.SubElement(cf_audit, "Value").text = audit_status

        cf_penalty = ET.SubElement(custom_fields, "CustomizedField")
        ET.SubElement(cf_penalty, "Key").text = "PenaltyExposureMitigated"
        ET.SubElement(cf_penalty, "DataType").text = "String"
        ET.SubElement(cf_penalty, "Value").text = penalty_status

        # Format pretty XML
        xml_bytes = ET.tostring(root, encoding="utf-8")
        parsed = minidom.parseString(xml_bytes)
        return parsed.toprettyxml(indent="  ", encoding="utf-8").decode("utf-8")

    def generate_diff_payload(self, concept_id: str) -> Dict[str, Any]:
        """
        Returns a side-by-side XML diff payload: Raw Unaudited vs. Reconciled Lawful XML.
        Constructs both XML documents structurally via ElementTree rather than string replaces (M4).
        Reflects concept-specific characteristics (clean FOB vs customs defects vs freight vs drawback).
        """
        clean_cid = str(concept_id).lower().strip()
        if "clean" in clean_cid or "fob" in clean_cid:
            # Baseline Clean FOB: zero defects, raw and reconciled match identically
            line_items = [
                {
                    "line_number": 1,
                    "description": "Industrial Brushless DC Motors 480W",
                    "hts_code": "8501.31",
                    "value": Decimal("48000.00"),
                }
            ]
            clean_xml = self.generate_universal_interchange_xml(
                shipment_id="S-CLEAN-FOB-01",
                declaration_id="B-CLEAN-FOB-01",
                port_origin_code="CNSZX",
                port_origin_name="Shenzhen",
                port_dest_code="USLAX",
                port_dest_name="Los Angeles",
                invoice_number="INV-CLEAN-01",
                incoterm="FOB",
                invoice_amount=Decimal("48000.00"),
                insurance_amount=Decimal("0.00"),
                line_items=line_items,
                audit_status="CLEARED_NO_EXCEPTIONS",
                penalty_status="19_USC_1592_COMPLIANT",
            )
            return {
                "concept_id": concept_id,
                "status": "READY_FOR_INGESTION",
                "schema_version": "1.1",
                "reconciled_lawful_xml": clean_xml,
                "raw_unaudited_xml": clean_xml,
                "diff_summary": [],
            }

        if "freight" in clean_cid:
            reconciled_items = [
                {
                    "line_number": 1,
                    "description": "Ocean Containerized Freight Surcharge Audit",
                    "hts_code": "9901.00",
                    "value": Decimal("4500.00"),
                }
            ]
            raw_xml = self.generate_universal_interchange_xml(
                shipment_id="S-FREIGHT-OVERBILL",
                declaration_id="B-FREIGHT-OVERBILL",
                port_origin_code="CNSZX",
                port_origin_name="Shenzhen",
                port_dest_code="USLAX",
                port_dest_name="Los Angeles",
                invoice_number="FRT-2026-NIGHTMARE",
                incoterm="FOB",
                invoice_amount=Decimal("6047.50"),
                insurance_amount=Decimal("0.00"),
                line_items=reconciled_items,
                audit_status="UNVERIFIED_RAW_INGEST",
                penalty_status="CARRIER_OVERBILLING_DETECTED",
            )
            reconciled_xml = self.generate_universal_interchange_xml(
                shipment_id="S-FREIGHT-OVERBILL",
                declaration_id="B-FREIGHT-OVERBILL",
                port_origin_code="CNSZX",
                port_origin_name="Shenzhen",
                port_dest_code="USLAX",
                port_dest_name="Los Angeles",
                invoice_number="FRT-2026-NIGHTMARE",
                incoterm="FOB",
                invoice_amount=Decimal("4500.00"),
                insurance_amount=Decimal("0.00"),
                line_items=reconciled_items,
                audit_status="CLEARED_WITH_RECONCILIATION",
                penalty_status="OVERBILLING_INTERCEPTED",
            )
            return {
                "concept_id": concept_id,
                "status": "READY_FOR_INGESTION",
                "schema_version": "1.1",
                "reconciled_lawful_xml": reconciled_xml,
                "raw_unaudited_xml": raw_xml,
                "diff_summary": [
                    {
                        "node": "InvoiceAmount",
                        "raw": "6047.50",
                        "reconciled": "4500.00",
                        "statute": "FMC 46 U.S.C. § 41104",
                        "status": "OVERBILLING_DISALLOWED",
                    }
                ],
            }

        # Default / Concept 1 Customs:
        # Raw invoice misclassified at 8471.30, Reconciled at 8542.31
        reconciled_items = [
            {
                "line_number": 1,
                "description": "Industrial Controller Assembly with Integrated Circuitry",
                "hts_code": "8542.31",
                "value": Decimal("148500.00"),
            }
        ]
        reconciled_xml = self.generate_universal_interchange_xml(
            shipment_id=f"S-{concept_id.upper()}",
            port_origin_code="CNSZX",
            port_origin_name="Shenzhen",
            port_dest_code="USLAX",
            port_dest_name="Los Angeles",
            invoice_amount=Decimal("148500.00"),
            insurance_amount=Decimal("1450.00"),
            line_items=reconciled_items,
            audit_status="CLEARED_WITH_RECONCILIATION",
            penalty_status="19_USC_1592_PROTECTED",
        )

        raw_items = [
            {
                "line_number": 1,
                "description": "Industrial Controller Assembly with Integrated Circuitry",
                "hts_code": "8471.30",
                "value": Decimal("148500.00"),
            }
        ]
        raw_xml = self.generate_universal_interchange_xml(
            shipment_id=f"S-{concept_id.upper()}",
            port_origin_code="CNSZX",
            port_origin_name="Shenzhen",
            port_dest_code="USLAX",
            port_dest_name="Los Angeles",
            invoice_amount=Decimal("148500.00"),
            insurance_amount=Decimal("0.00"),
            line_items=raw_items,
            audit_status="UNVERIFIED_RAW_INGEST",
            penalty_status="UNAUDITED_DEFECT_EXPOSURE",
        )

        return {
            "concept_id": concept_id,
            "status": "READY_FOR_INGESTION",
            "schema_version": "1.1",
            "reconciled_lawful_xml": reconciled_xml,
            "raw_unaudited_xml": raw_xml,
            "diff_summary": [
                {
                    "node": "InsuranceAmount",
                    "raw": "0.00",
                    "reconciled": "1450.00",
                    "statute": "19 CFR § 152.103",
                    "status": "CORRECTED",
                },
                {
                    "node": "HarmonizedCode",
                    "raw": "8471.30",
                    "reconciled": "8542.31",
                    "statute": "WCO GRI 3(b)",
                    "status": "RECLASSIFIED",
                },
            ],
        }

cargowise_exporter = CargoWiseExportService()
cargowise_xml_generator = cargowise_exporter
