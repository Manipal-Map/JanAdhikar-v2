# Curated reference mapping used as RAG-style context for the resolver LLM.
# This is NOT exhaustive — it's a seed knowledge base. Extend as you learn
# real PIO office names for common issue types in your users' regions.

JURISDICTION_KB = {
    "roads_potholes_streetlights": {
        "typical_authority": "Municipal Corporation / Municipal Council (urban) OR PWD (state highways) OR NHAI (national highways)",
        "level": "Municipal/Local or State",
        "how_to_disambiguate": "Ask: is this a city road, state highway, or national highway? City road -> Municipal Corporation Engineering Dept. State highway -> State PWD. National highway -> NHAI Project Implementation Unit."
    },
    "pension_government": {
        "typical_authority": "Concerned Ministry/Department's Pension Disbursing Authority, OR Treasury Office (state pensions), OR CPAO (Central Pension Accounting Office for central govt pensions)",
        "level": "Central or State",
        "how_to_disambiguate": "Ask: central govt employee or state govt employee? Which department did they retire from?"
    },
    "tender_contract_records": {
        "typical_authority": "The department/body that floated the tender (Municipal Corporation, PWD, Smart City SPV, etc.)",
        "level": "Depends on tendering authority",
        "how_to_disambiguate": "Ask which department/scheme the tender belongs to."
    },
    "land_records_property": {
        "typical_authority": "Tehsildar / Sub-Registrar / Revenue Department (District Collectorate)",
        "level": "State/District",
        "how_to_disambiguate": "Ask for district and tehsil."
    },
    "consumer_product_service": {
        "typical_authority": "Not RTI — District Consumer Disputes Redressal Commission / e-Daakhil / National Consumer Helpline (1915)",
        "level": "N/A (Grievance route, not RTI)",
        "how_to_disambiguate": "This is private-party, not a public authority — route to Grievance pipeline."
    },
    "tenancy_deposit": {
        "typical_authority": "Rent Authority (if state has Model Tenancy Act adoption) OR Civil Court — Grievance route",
        "level": "State",
        "how_to_disambiguate": "Check if state has a Rent Authority under Model Tenancy Act; else civil remedy."
    },
    "employment_pf_esi": {
        "typical_authority": "EPFO Regional Office (PF) / ESIC Regional Office (ESI) / Labour Commissioner (wages/termination)",
        "level": "Central (EPFO/ESIC) or State (Labour dept)",
        "how_to_disambiguate": "Ask which specific issue: PF withdrawal, ESI claim, or wage/termination dispute."
    },
    "passport_visa": {
        "typical_authority": "Regional Passport Office (RPO) under Ministry of External Affairs",
        "level": "Central",
        "how_to_disambiguate": "Identify nearest RPO by applicant's jurisdiction city."
    },
    "electricity_water_utility": {
        "typical_authority": "State Electricity Distribution Company (DISCOM) / State/Municipal Water Board",
        "level": "State/Municipal",
        "how_to_disambiguate": "Ask which utility board serves the applicant's city."
    },
    "police_fir_status": {
        "typical_authority": "Office of the SHO of the concerned Police Station / SP Office (district) / DCP Office (metro)",
        "level": "State",
        "how_to_disambiguate": "Ask for the police station where FIR was filed."
    },
    "municipal_sanitation_health": {
        "typical_authority": "Municipal Corporation / Municipal Council — Health & Sanitation Dept",
        "level": "Municipal/Local",
        "how_to_disambiguate": "Ask for ward number/city."
    },
    "cpgrams_central_grievance": {
        "typical_authority": "File via CPGRAMS (pgportal.gov.in) which auto-routes to the concerned Central Ministry/Dept",
        "level": "Central",
        "how_to_disambiguate": "For any central govt service deficiency where department is unclear, CPGRAMS itself does the routing."
    },
}
