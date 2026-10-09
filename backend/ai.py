# T1D Spatial Atlas AI chat backend: plans tool calls, runs FOV / gene-expression plots and
# literature helpers in parallel, and synthesizes the reply for POST /chat.
#
# Pipeline (same shape as ai_GUTOMICS.py):
#   1. Planner     - Claude returns a structured plan (JSON schema output, no forced tool_choice).
#   2. Executor    - planned calls are validated server-side and run concurrently.
#   3. Synthesizer - Claude sees the tool results (including plot images) and writes the reply.
import base64
import binascii
import difflib
import json
import os
import re
import threading
import time
import traceback
from _thread import start_new_thread
from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
from io import BytesIO
from queue import Queue
from typing import Any, Dict, List, Optional, Tuple, Union

import anthropic
import requests

import config

__all__ = ['process_ai_chat']


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ANTHROPIC_API_KEY = (
    getattr(config, 'ANTHROPIC_API_KEY', None)
    or os.environ.get('ANTHROPIC_API_KEY')
    or getattr(config, 'api_key', None)
    or getattr(config, 'API_KEY', None)
)
ANTHROPIC_MODEL = getattr(config, 'anthropic_model', None) or os.environ.get('ANTHROPIC_MODEL', 'claude-opus-5-5')
PLANNER_EFFORT = os.environ.get('AI_PLANNER_EFFORT', 'low')
SYNTH_EFFORT = os.environ.get('AI_SYNTH_EFFORT', 'medium')
# Server-side refusal fallback (biology questions can trip safety classifiers on newer models).
USE_REFUSAL_FALLBACK = os.environ.get('AI_REFUSAL_FALLBACK', '1') != '0'

# R plot server (gene expression + FOV with genes). Requests are hex-encoded JSON in the path.
R_PLOT_BASE = os.environ.get('T1D_R_PLOT_BASE', 'http://128.84.40.121:5000').rstrip('/')
R_PLOT_TIMEOUT = int(os.environ.get('T1D_R_PLOT_TIMEOUT', '950'))  # matches frontend
# Optional local root of the static site, so no-gene FOV PNGs can also be shown to Claude.
T1D_STATIC_ROOT = os.environ.get('T1D_STATIC_ROOT', '')
PRECOMPUTED_FOV_URL = '/spatial_plots/t1d_precomputed/left/{cond}/{donor}/{fov}.png'

GLKB_API_BASE = (
    os.environ.get('GLKB_API_BASE')
    or os.environ.get('GLKB_LLM_AGENT_URL')
    or 'https://jieliulab3.dcmb.med.umich.edu/hirn-literature-api'
).rstrip('/')
C2S_AGENT_BASE = os.environ.get('C2S_AGENT_BASE', 'https://jieliulab3.dcmb.med.umich.edu/c2s-agent')

LOG_PATH = os.environ.get('AI_LOG_PATH', '../openai_logs.txt')

RATE_LIMIT_PER_HOUR = 100
MAX_TURNS = 30
MAX_MSG_CHARS = 4000
MAX_PLAN_STEPS = 6       # caps parallel load on the R server per turn
FOV_MAX_GENES = 1        # more genes -> send the user to the FOV viewer (slow to render)
ANTHROPIC_IMAGE_MAX_SIDE = int(os.environ.get('ANTHROPIC_IMAGE_MAX_SIDE', '4096'))


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------

DONORS_BY_CONDITION = {
    'Control': ['ICRH098', 'ICRH112', 'ICRH148', 'ICRH151', 'ICRH153', 'ICRH154'],
    'T1D': ['AAIH158', 'ACKM419', 'ICRH069', 'ICRH083', 'ICRH084', 'ICRH173'],
}
DONOR_TO_CONDITION = {d: c for c, donors in DONORS_BY_CONDITION.items() for d in donors}
ALL_DONORS = list(DONOR_TO_CONDITION)
# Folder names of the precomputed no-gene FOV images.
CONDITION_DIR = {'Control': 'CTRL', 'T1D': 'T1D'}
# Optional per-donor valid FOV ranges, e.g. {'ICRH069': (1, 40)}. Empty -> FOV is not range-checked.
FOV_RANGES: Dict[str, Tuple[int, int]] = {}

CELL_TYPES = [
    'Acinar', 'Alpha', 'B cell', 'Beta', 'Delta+Gamma', 'Dendritic cell', 'Ductal', 'Endothelial',
    'Fibroblast', 'Macrophage', 'Mast cell', 'Mesenchymal+Endothelial', 'Monocyte', 'NK cell',
    'Pericytes', 'Polyhormonal', 'T cell', 'Unknown',
]

# Genes on the spatial panel (1000). Names containing a space are written with '_' here.
_GENES_RAW = """
AATK ABL1 ABL2 ACACB ACE ACKR1 ACKR3 ACKR4 ACP5 ACTA2 ACTG2 ACVR1 ACVR1B ACVR2A ACVRL1 ADGRA2
ADGRA3 ADGRE2 ADGRE5 ADGRF1 ADGRF3 ADGRF5 ADGRG1 ADGRG3 ADGRG5 ADGRG6 ADGRL1 ADGRL2 ADGRL4
ADGRV1 ADIPOQ ADIRF ADM2 AGR2 AHI1 AHR AIF1 AKT1 ALCAM ALOX5AP ANGPT1 ANGPT2 ANGPTL1 ANKRD1
ANXA1 ANXA2 ANXA4 APOA1 APOC1 APOD APOE APP AQP3 AR AREG ARF1 ARG1 ARHGDIB ARID5B ATF3 ATG10
ATG12 ATG5 ATM ATP5F1B ATP5F1E ATR AXL AZGP1 AZU1 B2M B3GNT7 BAG3 BASP1 BAX BBLN BCL2 BCL2L1
BECN1 BEST1 BGN BID BIRC3 BIRC5 BMP1 BMP2 BMP3 BMP4 BMP5 BMP7 BMPR1A BMPR2 BRAF BRCA1 BST1 BST2
BTF3 BTG1 BTK C11orf96 C1QA C1QB C1QC C5AR2 CACNA1C CALB1 CALD1 CALM1 CALM2 CALM3 CAMP CARMN
CASP3 CASP8 CASR CAV1 CCDC80 CCL11 CCL13 CCL15 CCL17 CCL18 CCL19 CCL2 CCL20 CCL21 CCL22 CCL26
CCL28 CCL3/L1/L3 CCL4/L1/L2 CCL5 CCL8 CCND1 CCR1 CCR10 CCR2 CCR5 CCR7 CCRL2 CD14 CD163 CD164
CD19 CD1C CD2 CD209 CD22 CD24 CD27 CD274 CD276 CD28 CD300A CD33 CD34 CD36 CD37 CD38 CD3D CD3E
CD3G CD4 CD40 CD40LG CD44 CD47 CD48 CD52 CD53 CD55 CD58 CD59 CD5L CD63 CD68 CD69 CD70 CD74 CD79A
CD80 CD81 CD83 CD84 CD86 CD8A CD8B CD9 CD93 CDH1 CDH11 CDH19 CDH5 CDKN1A CDKN3 CEACAM1 CEACAM6
CELSR1 CELSR2 CENPF CFD CFLAR CHEK1 CHEK2 CHI3L1 CIDEA CIITA CLCF1 CLDN4 CLEC10A CLEC12A CLEC14A
CLEC1A CLEC2B CLEC2D CLEC4A CLEC4D CLEC4E CLEC5A CLEC7A CLOCK CLU CMKLR1 CNTFR COL11A1 COL12A1
COL14A1 COL15A1 COL16A1 COL17A1 COL18A1 COL1A1 COL1A2 COL21A1 COL27A1 COL3A1 COL4A1 COL4A2
COL4A5 COL5A1 COL5A2 COL5A3 COL6A1 COL6A2 COL6A3 COL8A1 COL9A2 COL9A3 COTL1 COX4I2 CPA3 CPB1
CRIP1 CRP CRYAB CSF1 CSF1R CSF2 CSF2RA CSF2RB CSF3 CSF3R CSHL1 CSK CSPG4 CST7 CSTB CTLA4 CTNNB1
CTSD CTSG CTSW CUZD1 CX3CL1 CX3CR1 CXCL1/2/3 CXCL10 CXCL12 CXCL13 CXCL14 CXCL16 CXCL17 CXCL5
CXCL8 CXCL9 CXCR1 CXCR2 CXCR3 CXCR4 CXCR5 CXCR6 CYP1B1 CYP2U1 CYSTM1 CYTOR DCN DDC DDIT3 DDR1
DDR2 DDX58 DHRS2 DLL1 DLL4 DMBT1 DNMT1 DNMT3A DPP4 DPT DST DUSP1 DUSP2 DUSP4 DUSP5 DUSP6 EFNA1
EFNA4 EFNA5 EFNB1 EFNB2 EGF EGFR EIF5A/L1 ELANE EMP3 ENG ENO1 ENTPD1 EOMES EPCAM EPHA2 EPHA3
EPHA4 EPHA7 EPHB2 EPHB3 EPHB4 EPHB6 EPOR ERBB2 ERBB3 ESAM ESR1 ETS1 ETV4 ETV5 EZH2 EZR FABP4
FABP5 FAM30A FAP FAS FASLG FASN FAU FCER1G FCGBP FCGR3A/B FCRLA FES FFAR2 FFAR3 FFAR4 FGF1 FGF12
FGF13 FGF18 FGF2 FGF7 FGF9 FGFR1 FGFR2 FGFR3 FGG FGR FHIT FKBP11 FKBP5 FLT1 FLT3LG FN1 FOS FOXF1
FOXP3 FPR1 FYB1 FYN FZD1 FZD3 FZD4 FZD5 FZD6 FZD7 FZD8 G0S2 G6PD GADD45B GAS6 GATA3 GC GCG GDF15
GLUD1 GLUL GNLY GPBAR1 GPER1 GPNMB GPR183 GPX1 GPX3 GSK3B GSN GSTP1 GZMA GZMB GZMH GZMK H2AZ1
H4C3 HAVCR2 HBA1/2 HBB HCAR2/3 HCK HCST HDAC1 HDAC11 HDAC3 HDAC4 HDAC5 HEXB HEY1 HGF HIF1A
HILPDA HLA-DPA1 HLA-DPB1 HLA-DQA1 HLA-DQB1/2 HLA-DRA HLA-DRB HMGB2 HMGCS1 HMGN2 HPGDS HSD17B2
HSP90AA1 HSP90AB1 HSP90B1 HSPA1A/B HSPB1 HSPG2 HTT IAPP ICA1 ICAM1 ICAM2 ICAM3 ICOS ICOSLG IDO1
IER3 IFI27 IFI44L IFI6 IFIH1 IFIT1 IFIT3 IFITM1 IFITM3 IFNA1/13 IFNAR1 IFNAR2 IFNG IFNGR1 IFNGR2
IFNL2/3 IGF1 IGF1R IGF2 IGF2R IGFBP3 IGFBP5 IGFBP6 IGFBP7 IGHA1 IGHD IGHG1 IGHG2 IGHM IGKC IKZF3
IL10 IL10RA IL10RB IL11 IL11RA IL12A IL12B IL12RB1 IL12RB2 IL13RA1 IL15 IL15RA IL16 IL17A IL17B
IL17D IL17RA IL17RB IL17RE IL18 IL18R1 IL1A IL1B IL1R1 IL1R2 IL1RAP IL1RL1 IL1RN IL2 IL20 IL20RA
IL22RA1 IL23A IL24 IL27RA IL2RA IL2RB IL2RG IL32 IL33 IL34 IL36G IL3RA IL4R IL6 IL6R IL6ST IL7
IL7R INHA INHBA INHBB INS INSIG1 INSR IRF3 IRF4 ISG15 ITGA1 ITGA2 ITGA3 ITGA5 ITGA6 ITGA8 ITGA9
ITGAE ITGAL ITGAM ITGAV ITGAX ITGB1 ITGB2 ITGB4 ITGB5 ITGB6 ITGB8 ITK ITM2A ITM2B JAG1 JAK1 JAK2
JCHAIN JUN JUNB KDR KIT KITLG KLF2 KLK3 KLRB1 KLRF1 KLRK1 KRAS KRT1 KRT10 KRT13 KRT14 KRT15
KRT16 KRT17 KRT18 KRT19 KRT20 KRT23 KRT4 KRT5 KRT6A/B/C KRT7 KRT8 KRT80 KRT86 LAG3 LAIR1 LAMA4
LAMP2 LAMP3 LCN2 LDB2 LDHA LDLR LEFTY1 LEP LGALS1 LGALS3 LGALS3BP LGALS9 LGR5 LIF LIFR LINC01781
LINC01857 LINC02446 LMNA LPAR5 LTB LTBR LTF LUM LY6D LY75 LYN LYVE1 LYZ MAF MALAT1 MAML2
MAP1LC3B/2 MAP2K1 MAPK13 MAPK14 MARCKSL1 MARCO MB MECOM MEG3 MERTK MET MFAP5 MGP MHC_I MIF
MIR4435-2HG MKI67 MMP1 MMP12 MMP14 MMP19 MMP2 MMP7 MMP9 MPO MRC1 MRC2 MS4A1 MS4A4A MS4A6A MSMB
MSR1 MST1R MT1X MT2A MTOR MX1 MXRA8 MYC MYH11 MYH6 MYL12A MYL4 MYL7 MYL9 MZB1 MZT2A/B NACA NANOG
NCAM1 NCR1 NDRG1 NDUFA4L2 NEAT1 NELL2 NFKB1 NFKBIA NGFR NKG7 NLRC4 NLRC5 NLRP1 NLRP2 NLRP3 NOD2
NOSIP NOTCH1 NOTCH2 NOTCH3 NPPC NPR1 NPR2 NPR3 NR1H2 NR1H3 NR2F2 NR3C1 NRG1 NRXN1 NRXN3 NTRK2
NUPR1 NUSAP1 OAS1 OAS2 OAS3 OASL OLFM4 OLR1 OSM OSMR P2RX5 PARP1 PCNA PDCD1 PDCD1LG2 PDGFA PDGFB
PDGFC PDGFD PDGFRA PDGFRB PDS5A PECAM1 PF4/V1 PFN1 PGF PGK1 PGR PHLDA2 PIGR PLAC8 PLAC9 PLCG1
PLD3 PNOC POU5F1 PPARA PPARD PPARG PPIA PRF1 PROX1 PRSS2 PRTN3 PSAP PSCA PSD3 PTEN PTGDR2 PTGDS
PTGES PTGES2 PTGES3 PTGIS PTGS1 PTGS2 PTK2 PTK6 PTPRC PTPRCAP PTTG1 PXDN QRFPR RAC1 RAC2 RACK1
RAG1 RAMP1 RAMP2 RAMP3 RARA RARB RARG RARRES1 RARRES2 RB1 RBM47 RBPJ REG1A RELA RELT RGCC RGS1
RGS13 RGS2 RGS5 RNF43 ROR1 RORA RPL21 RPL22 RPL32 RPL34 RPL37 RPS4Y1 RSPO3 RUNX3 RXRA RXRB RYK
RYR2 S100A10 S100A2 S100A4 S100A6 S100A8 S100A9 S100B S100P SAA1/2 SAT1 SCG5 SCGB3A1 SEC23A
SEC61G SELENOP SELL SELPLG SERPINA1 SERPINA3 SERPINB5 SERPINH1 SFN SH3BGRL3 SIGIRR SLA SLC2A1
SLC40A1 SLCO2B1 SLPI SMAD2 SMAD3 SMAD4 SMARCB1 SMO SNAI1 SNAI2 SOD1 SOD2 SORBS1 SOSTDC1 SOX2
SOX4 SOX9 SPARCL1 SPINK1 SPOCK2 SPP1 SPRY2 SPRY4 SQLE SQSTM1 SRC SREBF1 SRGN SRSF2 SST ST6GAL1
ST6GALNAC3 STAT1 STAT3 STAT4 STAT5A STAT5B STAT6 STMN1 SYK TACSTD2 TAGLN TAP1 TAP2 TBX21 TCAP
TCF7 TCL1A TEK TFEB TGFB1 TGFB2 TGFB3 TGFBI TGFBR1 TGFBR2 THBS1 THBS2 THSD4 TIE1 TIGIT TIMP1
TLR1 TLR2 TLR3 TLR4 TLR5 TLR7 TLR8 TM4SF1 TNF TNFAIP6 TNFRSF10A TNFRSF10B TNFRSF10D TNFRSF11A
TNFRSF11B TNFRSF12A TNFRSF13B TNFRSF14 TNFRSF17 TNFRSF18 TNFRSF19 TNFRSF1A TNFRSF1B TNFRSF21
TNFRSF4 TNFRSF9 TNFSF10 TNFSF12 TNFSF13B TNFSF14 TNFSF15 TNFSF4 TNFSF8 TNFSF9 TNNC1 TNNT2 TNXA/B
TOP2A TOX TP53 TPI1 TPM1 TPM2 TPSAB1/B2 TPT1 TSC22D1 TSHZ2 TTN TTR TUBB TUBB4B TWIST1 TWIST2 TXK
TYK2 TYMS TYROBP UBA52 UBE2C UPK3A VCAM1 VCAN VEGFA VEGFB VEGFC VEGFD VHL VIM VPREB3 VSIR VTN
VWA1 VWF WIF1 WNT10B WNT11 WNT3 WNT5A WNT5B WNT7A WNT7B WNT9A XBP1 XCL1/2 XKR4 YBX3 YES1 ZBTB16
ZFP36
"""
GENES = [g.replace('_', ' ') for g in _GENES_RAW.split()]


def _gene_key(s: str) -> str:
    return re.sub(r'[\s_.\-]', '', str(s).upper())


def _combined_probe_members(name: str) -> List[str]:
    """Members of a combined probe: 'CCL3/L1/L3' -> CCL3, CCL3L1, CCL3L3; 'HBA1/2' -> HBA1, HBA2."""
    parts = name.split('/')
    if len(parts) < 2:
        return []
    first = parts[0]
    members = [first]
    for s in parts[1:]:
        if s.isdigit() and first[-1].isdigit():
            members.append(first.rstrip('0123456789') + s)
        elif len(s) == 1 and s.isalpha() and first[-1].isalpha():
            members.append(first[:-1] + s)
        else:
            members.append(first + s)
    return members


# Normalized name -> panel name. Members of combined probes resolve to the probe, so "CCL3" -> "CCL3/L1/L3".
GENE_LOOKUP: Dict[str, str] = {_gene_key(g): g for g in GENES}
for _g in GENES:
    for _member in _combined_probe_members(_g):
        GENE_LOOKUP.setdefault(_gene_key(_member), _g)
# Common protein / trivial names -> panel symbol.
GENE_ALIASES = {
    'INSULIN': 'INS', 'GLUCAGON': 'GCG', 'SOMATOSTATIN': 'SST', 'AMYLIN': 'IAPP',
    'PD1': 'PDCD1', 'PDL1': 'CD274', 'PDL2': 'PDCD1LG2', 'CD31': 'PECAM1', 'CD45': 'PTPRC',
    'CD20': 'MS4A1', 'CD56': 'NCAM1', 'CD11B': 'ITGAM', 'CD11C': 'ITGAX', 'CD25': 'IL2RA',
    'CD103': 'ITGAE', 'CD279': 'PDCD1', 'KI67': 'MKI67', 'IFNGAMMA': 'IFNG', 'TNFALPHA': 'TNF',
    'HLAI': 'MHC I', 'HLACLASSI': 'MHC I', 'MHCCLASSI': 'MHC I', 'VIMENTIN': 'VIM',
}
for _alias, _g in GENE_ALIASES.items():
    GENE_LOOKUP.setdefault(_gene_key(_alias), _g)


def _norm(s: str) -> str:
    return re.sub(r'[^a-z0-9+]', '', str(s).lower())


def _match(options: List[str], value: str) -> Optional[str]:
    """Case/spacing-insensitive lookup; also tolerates a trailing plural 's'."""
    v = _norm(value)
    for o in options:
        if _norm(o) == v:
            return o
    if v.endswith('s'):
        for o in options:
            if _norm(o) == v[:-1]:
                return o
    return None


def _canonical_gene(gene: str) -> Optional[str]:
    return GENE_LOOKUP.get(_gene_key(gene))


# ---------------------------------------------------------------------------
# Tool schemas — single source of truth for the planner's output schema and
# the synthesizer's tool definitions.
# ---------------------------------------------------------------------------

TOOL_SPECS = [
    {
        'name': 'fov_image',
        'description': (
            'Show the spatial image of one field of view (FOV) for one donor, optionally colored by '
            f'up to {FOV_MAX_GENES} gene. The donor determines the condition (Control or T1D). '
            'With no genes, a precomputed cell-type map is shown instantly; with a gene, the plot '
            'is rendered on demand.'
        ),
        'input_schema': {
            'type': 'object',
            'properties': {
                'donor': {'type': 'string', 'enum': ALL_DONORS, 'description': 'Donor (patient) ID.'},
                'fov': {'type': 'integer', 'description': 'FOV number (positive integer).'},
                'genes': {
                    'type': 'array',
                    'items': {'type': 'string'},
                    'description': f'Gene symbols on the site panel; empty for no gene, at most {FOV_MAX_GENES}.',
                },
            },
            'required': ['donor', 'fov', 'genes'],
            'additionalProperties': False,
        },
    },
    {
        'name': 'gene_expression',
        'description': 'Plot expression of one or more genes across the selected annotated cell types.',
        'input_schema': {
            'type': 'object',
            'properties': {
                'genes': {
                    'type': 'array',
                    'items': {'type': 'string'},
                    'description': 'At least one gene symbol on the site panel.',
                },
                'cell_types': {
                    'type': 'array',
                    'items': {'type': 'string', 'enum': CELL_TYPES},
                    'description': 'At least one annotated cell type.',
                },
            },
            'required': ['genes', 'cell_types'],
            'additionalProperties': False,
        },
    },
    {
        'name': 'glkb_ai_assistant',
        'description': (
            'GLKB biomedical literature Q&A (PubMed-grounded, with references). Receives only the '
            '`question` string, no chat history, so it must be a specific, self-contained research question.'
        ),
        'input_schema': {
            'type': 'object',
            'properties': {
                'question': {'type': 'string', 'description': 'Standalone, retrieval-ready literature question.'},
            },
            'required': ['question'],
            'additionalProperties': False,
        },
    },
    {
        'name': 'cell2sentence_ai_assistant',
        'description': (
            'Cell2Sentence (C2S) cell-centric assistant for cell type / cell state interpretation. '
            'Receives only the `message` string, no chat history.'
        ),
        'input_schema': {
            'type': 'object',
            'properties': {
                'message': {'type': 'string', 'description': 'Standalone cell-biology question.'},
            },
            'required': ['message'],
            'additionalProperties': False,
        },
    },
]
TOOL_NAMES = [t['name'] for t in TOOL_SPECS]
PLOT_TOOLS = ('fov_image', 'gene_expression')
_SPEC_BY_NAME = {t['name']: t for t in TOOL_SPECS}

# Synthesizer tools: always the full set so the cached prefix stays stable; called with tool_choice none.
SYNTH_TOOLS = [
    {'name': t['name'], 'description': t['description'], 'input_schema': t['input_schema']}
    for t in TOOL_SPECS
]


def _plan_schema(enabled_tools: List[str]) -> dict:
    """Plan = intro text + one array of calls per enabled tool (all calls run in parallel)."""
    properties: Dict[str, Any] = {'intro_text': {'type': 'string'}}
    for name in enabled_tools:
        properties[name] = {'type': 'array', 'items': deepcopy(_SPEC_BY_NAME[name]['input_schema'])}
    return {
        'type': 'object',
        'properties': properties,
        'required': list(properties),
        'additionalProperties': False,
    }


# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

SITE_OVERVIEW = """T1D Spatial Atlas is a website presenting single-cell-resolution spatial transcriptomics of human pancreas tissue from organ donors with type 1 diabetes (T1D) and non-diabetic controls. Users browse field-of-view (FOV) images of tissue sections with cells colored by annotated cell type or by gene expression, and compare gene expression across annotated cell types (islet endocrine, exocrine, immune, and stromal populations).

Donors (patients) and their condition — every donor belongs to exactly one condition:
- Control: ICRH098, ICRH112, ICRH148, ICRH151, ICRH153, ICRH154
- T1D: AAIH158, ACKM419, ICRH069, ICRH083, ICRH084, ICRH173

Annotated cell types: Acinar, Alpha, B cell, Beta, Delta+Gamma, Dendritic cell, Ductal, Endothelial, Fibroblast, Macrophage, Mast cell, Mesenchymal+Endothelial, Monocyte, NK cell, Pericytes, Polyhormonal, T cell, Unknown."""

PLANNER_SYSTEM_PROMPT = f"""You are the planner for the T1D Spatial Atlas chat assistant. Read the conversation and output a JSON plan of tool calls that will answer the user's latest message. A second step will see the tool results and write the reply to the user, so you do not answer the user yourself.

## The site

{SITE_OVERVIEW}

## Tools

Every call you list runs in parallel, so only list calls that do not depend on each other. List at most {MAX_PLAN_STEPS} calls in total.

### fov_image(donor, fov, genes)
Spatial image of one FOV for one donor. The condition is inferred from the donor.
- genes = [] shows the precomputed cell-type map (instant).
- genes may hold at most {FOV_MAX_GENES} gene. If the user wants more genes in one FOV, do not call the tool with them; mention in intro_text that multi-gene FOV views are slow and are available in the dedicated FOV viewer page. You may still show the FOV with the first gene if that clearly helps.
- If the user asks for "an example" FOV without naming a donor or FOV number, pick one yourself (the first donor of the requested condition, FOV 1) instead of asking.
- If the user names a donor that is not in the list, or pairs a donor with the wrong condition, do not guess: plan nothing for that part and the reply will explain.

### gene_expression(genes, cell_types)
Expression of one or more genes across selected cell types. At least one gene and one cell type. If the user does not name cell types, choose the ones that make the comparison meaningful (e.g. the endocrine types for hormone genes), or all relevant types for a broad "where is X expressed" question.

### glkb_ai_assistant(question)
Literature-grounded answers from the Genomic Literature Knowledge Base (PubMed). GLKB sees only `question`, never the chat history, and does poorly on vague or chatty wording, so write a focused research question yourself:
- Name concrete entities (genes, cell types, pancreas/islet context, T1D) and resolve pronouns from the conversation.
- Ask what published literature reports, summarizes, or compares.
- Keep it neutral; turn personal or medical-advice questions into "what does the literature report about ..." questions.
Use it for mechanisms, disease biology, gene function, and background the plots alone cannot answer. Do not use it for site navigation help.

### cell2sentence_ai_assistant(message)
Cell2Sentence, a cell-centric model for interpreting cell types and cell states. Sees only `message`. Use it when the user asks to interpret a cell population or cell state, typically alongside glkb_ai_assistant or a plot.

## Genes

The spatial panel has about 1000 genes (immune, signaling, endocrine and tissue markers), not the whole transcriptome. Use official HGNC symbols; map common names when unambiguous (e.g. "insulin" -> INS, "glucagon" -> GCG, "somatostatin" -> SST, "amylin" -> IAPP). The server checks every gene against the panel: pass the genes the user asked for, and if one is not on the panel the tool result will say so and suggest the closest panel genes.

Useful markers that are on the panel: Beta INS, IAPP; Alpha GCG; Delta SST; Acinar PRSS2, CPB1, REG1A, SPINK1; Ductal KRT19, KRT7; Endothelial PECAM1, VWF; Fibroblast/stroma COL1A1, DCN, PDGFRB; Macrophage CD68, CD163; T cell CD3E, CD8A, CD4; B cell MS4A1, CD19; NK NKG7, GNLY; Mast TPSAB1/B2, KIT; antigen presentation HLA-DRA, MHC I, B2M; interferon response STAT1, ISG15, CXCL10.

## Output

- intro_text: one short sentence shown to the user while tools run (e.g. "I'll pull up the INS expression in beta and alpha cells."). Use an empty string when you plan no calls.
- One array per tool; use [] for tools you are not calling.
- Plan no calls for greetings, thanks, questions about how to use the site, general questions you can answer from knowledge, or requests the tools cannot serve.

## Examples

"Show insulin and glucagon in islet cells" -> gene_expression(genes=["INS","GCG"], cell_types=["Beta","Alpha","Delta+Gamma","Polyhormonal"])
"Show FOV 12 of ICRH069 with CD8A" -> fov_image(donor="ICRH069", fov=12, genes=["CD8A"])
"Give me an example control FOV" -> fov_image(donor="ICRH098", fov=1, genes=[])
"Compare FOV 3 of ICRH098 and ICRH069" -> two fov_image calls
"Where is HLA-DRA expressed?" -> gene_expression(genes=["HLA-DRA"], cell_types=[the immune, endocrine, ductal and endothelial types])
"Why are beta cells lost in T1D? Show beta cell markers too" -> glkb_ai_assistant(question="What does the literature report about the mechanisms of beta-cell loss in human type 1 diabetes, including insulitis, CD8+ T-cell cytotoxicity, and HLA class I hyperexpression?") + gene_expression(genes=["INS","IAPP"], cell_types=["Beta"])
"What do macrophages do in the pancreas?" -> glkb_ai_assistant(question="What does the literature describe about the phenotypes and roles of macrophages in the human pancreas and islets in health and type 1 diabetes?")
"How do I use the FOV viewer?" -> no calls
"""

SYNTH_SYSTEM_PROMPT = f"""You are the AI assistant of T1D Spatial Atlas, chatting with researchers and visitors on the website.

## The site

{SITE_OVERVIEW}

The site's tools: fov_image (spatial view of one FOV for one donor, optionally colored by one gene; multi-gene FOV views are available in the dedicated FOV viewer page because they are slow to render), gene_expression (expression of genes across annotated cell types), GLKB (PubMed-grounded literature assistant) and Cell2Sentence (cell-centric interpretation assistant).

## How this turn works

Before you reply, a planner has already chosen and run any tools for the user's latest message. You see those calls and their results; you cannot call tools yourself. Every figure a tool produced is displayed to the user in the chat next to your reply, in the order the calls were made.

- When a tool result includes an image, describe what it shows in a few sentences: which donor, FOV, genes, and cell types, and the notable patterns (where expression concentrates, islet vs exocrine regions, immune cells near islets, differences between conditions). Be honest about what a single FOV or plot can and cannot show.
- When a plot result is text only, the figure was still sent to the user; do not say it failed. Refer to it ("the plot below shows ...") and explain what it represents from the parameters.
- When a tool result reports an error or a rejected input (unknown gene, donor not in the dataset, too many genes for one FOV), explain it plainly and suggest the closest valid option.
- When GLKB or Cell2Sentence answered, their full answers are already shown to the user. Do not repeat them; answer the user's original question in your own words, using their content as evidence and mentioning key references briefly where they matter.
- If no tools ran, answer directly from your knowledge and the site description. If the user's request needs a choice you cannot infer (which donor, which cell types), ask one short clarifying question and offer concrete options.

## Style

- Talk to the user directly ("you", "I"). Be concise and concrete; use short paragraphs or a brief list when comparing several things.
- Ground claims in the atlas when possible ("In this FOV from T1D donor ICRH069 ..."), and separate what the data shows from general literature knowledge.
- Never output JSON or tool-call syntax.
- You may answer unrelated general questions briefly, but keep the focus on the atlas, pancreas biology, and T1D. Do not give personal medical advice; you can describe what research reports."""


# ---------------------------------------------------------------------------
# Claude client
# ---------------------------------------------------------------------------

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def _claude_create(**kwargs):
    if USE_REFUSAL_FALLBACK:
        kwargs['extra_headers'] = {'anthropic-beta': 'server-side-fallback-2026-07-01'}
        kwargs['extra_body'] = {'fallbacks': 'default'}
    return client.messages.create(model=ANTHROPIC_MODEL, **kwargs)


def _response_text(resp) -> str:
    return '\n\n'.join(
        b.text for b in resp.content
        if getattr(b, 'type', None) == 'text' and b.text.strip()
    )


# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------

_rate_limit_records: List[float] = []
_rate_limit_lock = threading.Lock()


def within_rate_limit() -> bool:
    t = time.time()
    with _rate_limit_lock:
        _rate_limit_records[:] = [r for r in _rate_limit_records if t - r <= 3600]
        if len(_rate_limit_records) >= RATE_LIMIT_PER_HOUR:
            return False
        _rate_limit_records.append(t)
        return True


# ---------------------------------------------------------------------------
# History normalisation (frontend [{role, content: str}] -> Anthropic messages)
# ---------------------------------------------------------------------------

def _flat_to_anthropic(flat_history: list) -> list:
    msgs = []
    for m in flat_history:
        role = m.get('role')
        content = m.get('content', '')
        if role not in ('user', 'assistant'):
            continue
        if not isinstance(content, str):
            content = str(content)
        if not content.strip():
            continue
        if msgs and msgs[-1]['role'] == role:
            # Anthropic requires alternating roles: merge consecutive same-role messages.
            msgs[-1]['content'] += '\n' + content
        else:
            msgs.append({'role': role, 'content': content})
    while msgs and msgs[0]['role'] != 'user':
        msgs.pop(0)
    return msgs


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------

def _png_for_claude(png_bytes: bytes) -> bytes:
    """Downscale so the longest side fits Claude's vision limit (hard limit 8000px).

    Only used for what Claude sees; the frontend keeps full resolution. Requires Pillow.
    """
    try:
        from PIL import Image
    except ImportError:
        print('ai_T1D: Pillow not installed; cannot downscale images for Claude (pip install Pillow).')
        return png_bytes
    try:
        im = Image.open(BytesIO(png_bytes))
        im.load()
        limit = min(ANTHROPIC_IMAGE_MAX_SIDE, 7999)
        w, h = im.size
        if max(w, h) <= limit:
            return png_bytes
        scale = limit / float(max(w, h))
        im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
        if im.mode not in ('RGB', 'RGBA', 'L', 'LA'):
            im = im.convert('RGBA' if 'transparency' in im.info else 'RGB')
        out = BytesIO()
        im.save(out, format='PNG', optimize=True)
        return out.getvalue()
    except Exception as e:
        print(f'_png_for_claude: could not process image ({e})')
        return png_bytes


def _image_result(description: str, png_bytes: Optional[bytes]) -> Union[str, list]:
    """tool_result content: the image (if we have it) plus a description."""
    if not png_bytes:
        return (
            f'{description} The figure was sent to the user\'s chat; its pixels are not attached '
            'here. This is normal, not an error.'
        )
    data = base64.b64encode(_png_for_claude(png_bytes)).decode('ascii')
    return [
        {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/png', 'data': data}},
        {'type': 'text', 'text': description},
    ]


def _call_r_plot(endpoint: str, request_data: dict) -> Tuple[Optional[str], Optional[str]]:
    """Call the R plot server. Returns (base64_png, error)."""
    hex_str = binascii.hexlify(json.dumps(request_data).encode('utf-8')).decode('utf-8')
    url = f'{R_PLOT_BASE}/{endpoint}/{hex_str}'
    try:
        resp = requests.get(url, timeout=R_PLOT_TIMEOUT)
    except Exception as e:
        return None, f'Error contacting the {endpoint} plot server: {e}'
    if resp.status_code != 200:
        return None, f'The {endpoint} plot server returned status {resp.status_code}.'
    try:
        img = resp.json().get('img')
    except ValueError:
        img = None
    if not img:
        return None, f'No image found in the {endpoint} plot server response.'
    return img, None


# ---------------------------------------------------------------------------
# Tool execution
# ---------------------------------------------------------------------------

ToolOutput = Tuple[Union[str, list], List[dict]]  # (tool_result content for Claude, frontend messages)


def _resolve_genes(raw_genes: list) -> Tuple[List[str], List[str]]:
    found, missing = [], []
    for g in raw_genes:
        canon = _canonical_gene(g)
        if canon is None:
            missing.append(str(g))
        elif canon not in found:
            found.append(canon)
    return found, missing


def _suggest_genes(query: str, n: int = 5) -> List[str]:
    """Closest panel genes for an unknown name: prefix matches first (CD8 -> CD8A, CD8B), then fuzzy."""
    key = _gene_key(query)
    if not key:
        return []
    # Prefer a letter right after the prefix: CD8 -> CD8A, CD8B before CD80, CD81.
    prefixed = [g for g in GENES if _gene_key(g).startswith(key)]
    prefixed.sort(key=lambda g: (len(_gene_key(g)), not _gene_key(g)[len(key):][:1].isalpha(), g))
    out = prefixed[:n]
    keys = {_gene_key(g): g for g in GENES}
    for k in difflib.get_close_matches(key, list(keys), n=n, cutoff=0.6):
        if keys[k] not in out:
            out.append(keys[k])
    return out[:n]


def _missing_genes_text(missing: List[str]) -> str:
    parts = []
    for g in missing:
        sugg = _suggest_genes(g)
        parts.append(f"{g} (closest panel genes: {', '.join(sugg)})" if sugg else f'{g} (no similar panel genes)')
    return 'genes not on the panel: ' + '; '.join(parts)


def _tool_fov_image(tool_input: dict) -> ToolOutput:
    donor = _match(ALL_DONORS, tool_input.get('donor', ''))
    if donor is None:
        return (f"Donor '{tool_input.get('donor')}' is not in this dataset. Valid donors: {', '.join(ALL_DONORS)}.", [])
    condition = DONOR_TO_CONDITION[donor]
    try:
        fov = int(tool_input.get('fov'))
    except (TypeError, ValueError):
        return (f"FOV must be an integer, got {tool_input.get('fov')!r}.", [])
    rng = FOV_RANGES.get(donor)
    if fov < 1 or (rng and not rng[0] <= fov <= rng[1]):
        valid = f'{rng[0]}-{rng[1]}' if rng else 'a positive integer'
        return (f'FOV {fov} is not available for donor {donor}; valid FOVs: {valid}.', [])

    genes, missing = _resolve_genes(tool_input.get('genes') or [])
    notes = f' Skipped {_missing_genes_text(missing)}.' if missing else ''
    if len(genes) > FOV_MAX_GENES:
        return (
            f'FOV images in chat support at most {FOV_MAX_GENES} gene (requested {", ".join(genes)}). '
            'Multi-gene FOV views are available in the dedicated FOV viewer page.',
            [],
        )

    if not genes:
        url = PRECOMPUTED_FOV_URL.format(cond=CONDITION_DIR[condition], donor=donor, fov=fov)
        png_bytes = None
        if T1D_STATIC_ROOT:
            try:
                with open(os.path.join(T1D_STATIC_ROOT, url.lstrip('/')), 'rb') as f:
                    png_bytes = f.read()
            except OSError:
                pass
        desc = f'FOV cell-type map: condition={condition}, donor={donor}, fov={fov}.{notes}'
        return (_image_result(desc, png_bytes), [{'type': 'image', 'content': url}])

    img_b64, err = _call_r_plot('fov', {
        'f': 1, 'p1': condition, 'p2': donor, 'p3': fov, 'p4': ','.join(genes),
    })
    if err:
        return (f'FOV plot failed: {err}', [{'type': 'error', 'content': err}])
    desc = f'FOV image: condition={condition}, donor={donor}, fov={fov}, genes={genes}.{notes}'
    return (
        _image_result(desc, base64.b64decode(img_b64)),
        [{'type': 'image', 'content': f'data:image/png;base64,{img_b64}'}],
    )


def _tool_gene_expression(tool_input: dict) -> ToolOutput:
    genes, missing = _resolve_genes(tool_input.get('genes') or [])
    cell_types, bad_types = [], []
    for ct in tool_input.get('cell_types') or []:
        m = _match(CELL_TYPES, ct)
        if m is None:
            bad_types.append(str(ct))
        elif m not in cell_types:
            cell_types.append(m)
    problems = []
    if missing:
        problems.append(_missing_genes_text(missing))
    if bad_types:
        problems.append(f"unknown cell types: {', '.join(bad_types)} (valid: {', '.join(CELL_TYPES)})")
    if not genes or not cell_types:
        problems.append('need at least one valid gene and one valid cell type')
        return ('gene_expression not run: ' + '; '.join(problems) + '.', [])

    genes.sort()
    img_b64, err = _call_r_plot('gene_exp', {'f': 2, 'p1': ','.join(genes), 'p2': ','.join(cell_types)})
    if err:
        return (f'Gene expression plot failed: {err}', [{'type': 'error', 'content': err}])
    desc = f'Gene expression plot: genes={genes}, cell_types={cell_types}.'
    if problems:
        desc += ' Skipped: ' + '; '.join(problems) + '.'
    return (
        _image_result(desc, base64.b64decode(img_b64)),
        [{'type': 'image', 'content': f'data:image/png;base64,{img_b64}'}],
    )


def _tool_glkb(tool_input: dict) -> ToolOutput:
    question = (tool_input.get('question') or '').strip()
    if not question:
        return ('GLKB was called with an empty question.', [])
    success, answer = glkb_chat(question)
    if not success:
        return (f'GLKB call failed: {answer}', [{'type': 'error', 'content': f'GLKB call failed: {answer}'}])
    return (
        f'GLKB answer: {answer}',
        [{'type': 'text', 'content': f'Ask GLKB AI assistant: {question}\n\nAnswer:\n\n{answer}'}],
    )


def _tool_c2s(tool_input: dict) -> ToolOutput:
    message = (tool_input.get('message') or '').strip()
    if not message:
        return ('Cell2Sentence was called with an empty message.', [])
    success, answer = c2s_chat(message)
    if not success:
        return (f'Cell2Sentence call failed: {answer}', [{'type': 'error', 'content': f'Cell2Sentence call failed: {answer}'}])
    return (
        f'Cell2Sentence answer: {answer}',
        [{'type': 'text', 'content': f'Ask Cell2Sentence: {message}\n\nAnswer:\n\n{answer}'}],
    )


TOOL_HANDLERS = {
    'fov_image': _tool_fov_image,
    'gene_expression': _tool_gene_expression,
    'glkb_ai_assistant': _tool_glkb,
    'cell2sentence_ai_assistant': _tool_c2s,
}


def execute_tool(name: str, tool_input: dict) -> ToolOutput:
    handler = TOOL_HANDLERS.get(name)
    if handler is None:
        return (f"Unknown tool '{name}'.", [])
    try:
        return handler(tool_input)
    except Exception as e:
        traceback.print_exc()
        return (f"Tool '{name}' failed: {e}", [{'type': 'error', 'content': f'{name} failed: {e}'}])


def execute_plan_parallel(steps: List[dict]) -> List[ToolOutput]:
    """Run all planned calls concurrently; results keep the order of `steps`."""
    if not steps:
        return []
    with ThreadPoolExecutor(max_workers=min(8, len(steps))) as pool:
        futures = [pool.submit(execute_tool, s['tool'], s['input']) for s in steps]
        return [f.result() for f in futures]


# ---------------------------------------------------------------------------
# Planner -> Executor -> Synthesizer
# ---------------------------------------------------------------------------

def _summarize_call(step: dict) -> str:
    args = ', '.join(f'{k}={json.dumps(v, ensure_ascii=False)}' for k, v in step['input'].items())
    return f"{step['tool']}({args})"


def run_planner(anthropic_msgs: list, enabled_tools: List[str], disabled_note: str) -> Tuple[str, List[dict], str]:
    """Returns (intro_text, steps, truncation_note)."""
    system = [{'type': 'text', 'text': PLANNER_SYSTEM_PROMPT, 'cache_control': {'type': 'ephemeral'}}]
    if disabled_note:
        system.append({'type': 'text', 'text': disabled_note})
    resp = _claude_create(
        max_tokens=8000,
        system=system,
        messages=anthropic_msgs,
        output_config={
            'effort': PLANNER_EFFORT,
            'format': {'type': 'json_schema', 'schema': _plan_schema(enabled_tools)},
        },
    )
    if resp.stop_reason != 'end_turn':
        print(f'======== Planner stop_reason={resp.stop_reason}; continuing with no tool calls.')
        return '', [], ''
    plan = json.loads(_response_text(resp))
    log_queue.put(json.dumps({'planner': plan}, ensure_ascii=False))

    steps = [
        {'tool': name, 'input': call}
        for name in enabled_tools
        for call in plan.get(name) or []
        if isinstance(call, dict)
    ]
    note = ''
    if len(steps) > MAX_PLAN_STEPS:
        dropped = steps[MAX_PLAN_STEPS:]
        steps = steps[:MAX_PLAN_STEPS]
        note = (
            f'Only the first {MAX_PLAN_STEPS} tool calls were run this turn; not run: '
            + '; '.join(_summarize_call(s) for s in dropped)
            + '. Tell the user they can ask for these next.'
        )
    return (plan.get('intro_text') or '').strip(), steps, note


def get_ai_resp(history: list, agent_options: Dict[str, bool]) -> Tuple[bool, str, list]:
    """Returns (success, error_msg, frontend_messages). Appends the assistant turn to `history`."""
    try:
        glkb_on = agent_options.get('glkb', True)
        c2s_on = agent_options.get('c2s', True)
        enabled_tools = [
            n for n in TOOL_NAMES
            if not (n == 'glkb_ai_assistant' and not glkb_on)
            and not (n == 'cell2sentence_ai_assistant' and not c2s_on)
        ]
        disabled = []
        if not glkb_on:
            disabled.append('GLKB')
        if not c2s_on:
            disabled.append('Cell2Sentence')
        disabled_note = (
            f"The user turned off {' and '.join(disabled)} for this message; "
            'those tools are unavailable and must not be described as consulted.'
            if disabled else ''
        )

        anthropic_msgs = _flat_to_anthropic(history)
        if not anthropic_msgs or anthropic_msgs[-1]['role'] != 'user':
            return (False, 'No user message to respond to.', [])

        # Phase 1 - Planner
        intro_text, steps, truncation_note = run_planner(anthropic_msgs, enabled_tools, disabled_note)
        print(f"======== Planner: {len(steps)} step(s): {[s['tool'] for s in steps]}")

        collected: List[dict] = []
        if intro_text:
            collected.append({'type': 'text', 'content': intro_text})

        # Phase 2 - Executor
        synth_msgs = list(anthropic_msgs)
        if steps:
            results = execute_plan_parallel(steps)
            tool_uses, tool_results = [], []
            for i, (step, (result_content, display_msgs)) in enumerate(zip(steps, results)):
                collected.extend(display_msgs)
                tool_uses.append({'type': 'tool_use', 'id': f'plan_step_{i}', 'name': step['tool'], 'input': step['input']})
                tool_results.append({'type': 'tool_result', 'tool_use_id': f'plan_step_{i}', 'content': result_content})
            if truncation_note:
                tool_results.append({'type': 'text', 'text': truncation_note})
            synth_msgs.append({'role': 'assistant', 'content': tool_uses})
            synth_msgs.append({'role': 'user', 'content': tool_results})

        # Phase 3 - Synthesizer
        system = [{'type': 'text', 'text': SYNTH_SYSTEM_PROMPT, 'cache_control': {'type': 'ephemeral'}}]
        if disabled_note:
            system.append({'type': 'text', 'text': disabled_note})
        synth_resp = _claude_create(
            max_tokens=16000,
            system=system,
            messages=synth_msgs,
            tools=SYNTH_TOOLS,
            tool_choice={'type': 'none'},
            output_config={'effort': SYNTH_EFFORT},
        )
        print(f'======== Synthesizer stop_reason={synth_resp.stop_reason}')
        if synth_resp.stop_reason == 'refusal':
            reply = "Sorry, I can't help with that request. Feel free to ask about the atlas data or pancreas biology."
        else:
            reply = _response_text(synth_resp)
        if reply:
            collected.append({'type': 'text', 'content': reply})

        # History keeps the reply plus a compact record of what was shown, so later turns
        # ("now show it in T1D") have context. The frontend displays `messages`, not history.
        history_text = '\n\n'.join(p for p in (intro_text, reply) if p)
        if steps:
            history_text += '\n\n[Tools run this turn: ' + '; '.join(_summarize_call(s) for s in steps) + ']'
        if history_text.strip():
            history.append({'role': 'assistant', 'content': history_text})

        print(f'======== Claude success. {len(collected)} display messages.')
        return (True, '', collected)

    except Exception:
        traceback.print_exc()
        return (False, 'Failed to get the response from the AI. Please copy your input, refresh the page and try again.', [])


# ---------------------------------------------------------------------------
# GLKB literature integration
# ---------------------------------------------------------------------------

def _format_glkb_references(refs: Any, limit: int = 10) -> str:
    if not isinstance(refs, list) or not refs:
        return ''
    lines = []
    for i, ref in enumerate(refs[:limit], start=1):
        if not isinstance(ref, dict):
            continue
        title = (ref.get('title') or 'Untitled').strip()
        url = (ref.get('url') or '').strip()
        pmid = ref.get('pmid')
        if not url and pmid:
            url = f'https://pubmed.ncbi.nlm.nih.gov/{pmid}/'
        year = ref.get('date') or ''
        journal = (ref.get('journal') or '').strip()
        authors = ref.get('authors')
        author_str = ''
        if isinstance(authors, list):
            author_str = ', '.join(a for a in authors[:5] if isinstance(a, str) and a.strip())
            if len(authors) > 5:
                author_str += ' et al.'
        meta = ' — '.join(p for p in (author_str, f'({year})' if year else '', journal) if p)
        lines.append(f'{i}. {title}\n   {meta}\n   {url}')
    return '\n\nReferences:\n' + '\n'.join(lines) if lines else ''


def glkb_chat(question: str) -> Tuple[bool, str]:
    """Stateless one-shot call to GLKB: POST /stream (SSE), returns the Complete event's text."""
    base = GLKB_API_BASE
    if base.endswith('/llm_agent'):
        base = base[:-len('/llm_agent')]
    if not base:
        return False, 'GLKB is not configured (set GLKB_API_BASE).'

    payload = {'question': question, 'messages': [], 'max_articles': 10}
    max_attempts = 3
    last_err = 'Unknown error'
    for attempt in range(1, max_attempts + 1):
        try:
            with requests.post(
                f'{base}/stream',
                json=payload,
                stream=True,
                timeout=(10, 240),
                verify=False,
                headers={
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json',
                    'User-Agent': 't1d-atlas-glkb/1.0',
                },
            ) as r:
                ct = (r.headers.get('content-type') or '').lower()
                if not 200 <= r.status_code < 300:
                    return False, f'HTTP {r.status_code}. Content-Type: {ct}. Body: {(r.text or "")[:800]}'
                if 'text/event-stream' not in ct and 'application/json' not in ct:
                    return False, f'Expected SSE but got Content-Type: {ct}. Body: {(r.text or "")[:800]}'
                for raw_line in r.iter_lines(decode_unicode=True):
                    line = (raw_line or '').strip()
                    if not line.startswith('data:'):
                        continue
                    data_str = line[len('data:'):].strip()
                    if not data_str or data_str == '[DONE]':
                        continue
                    try:
                        obj = json.loads(data_str)
                    except json.JSONDecodeError:
                        continue
                    if obj.get('step') != 'Complete':
                        continue
                    resp = obj.get('response')
                    text = resp.strip() if isinstance(resp, str) else ''
                    text = (text + _format_glkb_references(obj.get('references'))).strip()
                    if text:
                        return True, text
                    return False, 'GLKB returned Complete with no response text.'
                return False, 'No Complete event in GLKB SSE stream.'
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            last_err = f'{type(e).__name__}: {e}'
            if attempt < max_attempts:
                time.sleep(1.5 * attempt)
                continue
            return False, f'Network/timeout after {max_attempts} attempts: {last_err}'
        except requests.exceptions.RequestException as e:
            return False, f'HTTP/network error: {type(e).__name__}: {e}'
    return False, last_err


def c2s_chat(message: str) -> Tuple[bool, str]:
    """Stateless one-shot call to Cell2Sentence: POST /chat {"message": ...}."""
    base = (C2S_AGENT_BASE or '').strip().rstrip('/')
    if not base:
        return False, 'C2S is not configured (set C2S_AGENT_BASE).'
    try:
        r = requests.post(
            f'{base}/chat',
            json={'message': message},
            timeout=(10, 240),
            verify=False,
            headers={'Content-Type': 'application/json', 'User-Agent': 't1d-atlas-c2s/1.0'},
        )
    except requests.exceptions.RequestException as e:
        return False, f'HTTP/network error calling C2S: {e}'
    try:
        data = r.json()
    except ValueError:
        return False, f'Invalid JSON (HTTP {r.status_code}): {(r.text or "")[:800]}'
    if not 200 <= r.status_code < 300:
        detail = (data.get('error') or data.get('detail')) if isinstance(data, dict) else None
        return False, f'HTTP {r.status_code}. {detail or (r.text or "")[:800]}'
    resp = data.get('response') if isinstance(data, dict) else None
    if isinstance(resp, str) and resp.strip():
        return True, resp.strip()
    return False, 'C2S returned no response text.'


# ---------------------------------------------------------------------------
# Chat entry
# ---------------------------------------------------------------------------

def handle_chat(payload: Any) -> Tuple[int, Any]:
    """Run one chat turn from a parsed JSON body.

    Accepts a message list (current frontend) or {"history": [...], "options": {"glkb": bool, "c2s": bool}}.
    Returns (status_code, body): body is {"history", "messages"} on success, else an error string or None.
    """
    agent_options = {'glkb': True, 'c2s': True}
    if isinstance(payload, list):
        history = payload
    elif isinstance(payload, dict) and isinstance(payload.get('history'), list):
        history = payload['history']
        opts = payload.get('options')
        if isinstance(opts, dict):
            agent_options['glkb'] = opts.get('glkb', True) is not False
            agent_options['c2s'] = opts.get('c2s', True) is not False
    else:
        return 400, 'Expected a JSON array of messages or {"history":[...],"options":{"glkb":true,"c2s":true}}'

    if not within_rate_limit():
        return 429, None

    history = history[-MAX_TURNS:]
    trimmed = []
    for m in history:
        if not isinstance(m, dict):
            continue
        c = m.get('content', '')
        if isinstance(c, str) and len(c) > MAX_MSG_CHARS:
            m = dict(m, content=c[:MAX_MSG_CHARS] + '…[truncated]')
        trimmed.append(m)
    history = trimmed

    log_queue.put(json.dumps({'history': history, 'options': agent_options}, ensure_ascii=False))
    success, error_msg, messages = get_ai_resp(history, agent_options)
    if not success:
        return 500, error_msg
    return 200, {'history': history, 'messages': messages}


def _send(request, status: int, body: bytes):
    request.send_response(status)
    request.send_header('Content-Length', len(body))
    request.send_header('Connection', 'keep-alive')
    request.send_header('Access-Control-Allow-Origin', '*')
    request.end_headers()
    request.wfile.write(body)
    request.wfile.flush()


def process_ai_chat(request, path: str):
    """R_http handler entry point (same signature as the previous OpenAI version)."""
    print('AI chat')
    raw = request.rfile.read(int(request.headers['Content-Length'])).decode('utf-8')
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        _send(request, 400, b'Invalid JSON body.')
        return
    status, body = handle_chat(payload)
    if body is None:
        data = b''
    elif isinstance(body, str):
        data = body.encode('utf-8')
    else:
        data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    _send(request, status, data)


# ---------------------------------------------------------------------------
# Async log writer
# ---------------------------------------------------------------------------

log_queue: Queue = Queue()


def write_logs():
    with open(LOG_PATH, 'a', encoding='utf-8') as f:
        f.write(f'\n\n{time.time() * 1000:.3f}: Server started\n')
        f.flush()
        while True:
            item = log_queue.get()
            f.write(f'{time.time() * 1000:.3f}: {item}\n')
            f.flush()


start_new_thread(write_logs, ())
