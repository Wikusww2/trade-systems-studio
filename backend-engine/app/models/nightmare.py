from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class CommercialInvoiceLineItem(BaseModel):
    line_number: int
    item_code: str
    description: str
    quantity: Decimal
    unit_price: Decimal
    stated_total: Decimal
    calculated_total: Decimal
    hts_code: str
    declared_rate: Decimal
    lawful_rate: Decimal
    is_math_error: bool = False
    is_classification_error: bool = False

class CommercialInvoiceData(BaseModel):
    invoice_number: str
    invoice_date: str
    seller_name: str
    buyer_name: str
    incoterms: str
    port_of_entry: str
    subtotal: Decimal
    freight_charge: Decimal
    insurance_charge: Decimal
    total_amount: Decimal
    has_missing_insurance: bool = False
    items: List[CommercialInvoiceLineItem] = Field(default_factory=list)

class FreightBillLineItem(BaseModel):
    charge_code: str
    description: str
    amount: Decimal
    is_authorized: bool = True
    authorized_max_amount: Optional[Decimal] = None
    overcharge_amount: Decimal = Decimal("0.00")

class FreightBillData(BaseModel):
    bill_number: str
    carrier_name: str
    consignee: str
    vessel_discharge_date: str
    container_pickup_date: str
    port_free_days_allowed: int = 4
    actual_days_held: int = 4
    is_detention_unwarranted: bool = False
    charges: List[FreightBillLineItem] = Field(default_factory=list)
    total_billed: Decimal = Decimal("0.00")
    total_overcharge: Decimal = Decimal("0.00")

class DutyDrawbackMatch(BaseModel):
    import_entry_number: str
    import_date: str
    export_bl_number: str
    export_date: str
    part_number: str
    description: str
    dutiable_value: Decimal
    duties_paid: Decimal
    drawback_statutory_rate: Decimal = Decimal("0.99")
    refundable_amount: Decimal
    is_timely_5yr_window: bool = True
