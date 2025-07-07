const GLB_FOV_DATA = {
  "1":  {"condition": "CTRL",   "patient": "HPAP-122"},
  "2":  {"condition": "CTRL",   "patient": "HPAP-129"},
  "3":  {"condition": "CTRL",   "patient": "HPAP-131"},
  "4":  {"condition": "CTRL",   "patient": "HPAP-140"},
  "5":  {"condition": "AB+LN-", "patient": "HPAP-024"},
  "6":  {"condition": "AB+LN-", "patient": "HPAP-045"},
  "7":  {"condition": "AB+LN-", "patient": "HPAP-072"},
  "8":  {"condition": "AB+LN-", "patient": "HPAP-092"},
  "9":  {"condition": "AB+LN-", "patient": "HPAP-148"},
  "10": {"condition": "AB+LN+", "patient": "HPAP-008"},
  "11": {"condition": "AB+LN+", "patient": "HPAP-016"},
  "12": {"condition": "AB+LN+", "patient": "HPAP-029"},
  "13": {"condition": "AB+LN+", "patient": "HPAP-038"},
  "14": {"condition": "AB+LN+", "patient": "HPAP-107"},
  "15": {"condition": "T1D",    "patient": "HPAP-078"},
  "16": {"condition": "T1D",    "patient": "HPAP-084"},
  "17": {"condition": "T1D",    "patient": "HPAP-089"},
  "18": {"condition": "T1D",    "patient": "HPAP-123"},
  "19": {"condition": "T1D",    "patient": "HPAP-149"}
}
const GLB_1ST_LEVEL = {};
const GLB_2ND_LEVEL = {};

const GLB_ALL_GENES = ['AATK', 'ABL1', 'ABL2', 'ACACB', 'ACE', 'ACKR1', 'ACKR3', 'ACKR4', 'ACTA2', 'ACTG2', 'ACVR1', 'ACVR1B', 'ACVR2A', 'ACVRL1', 'ADGRA2', 'ADGRA3', 'ADGRE2', 'ADGRE5', 'ADGRF1', 'ADGRF3', 'ADGRF5', 'ADGRG1', 'ADGRG3', 'ADGRG5', 'ADGRG6', 'ADGRL1', 'ADGRL2', 'ADGRL4', 'ADGRV1', 'ADIPOQ', 'ADIRF', 'ADM2', 'AGER', 'AGR2', 'AHI1', 'AHR', 'AIF1', 'AKT1', 'ALCAM', 'ANGPT1', 'ANGPT2', 'ANGPTL1', 'ANKRD1', 'ANXA1', 'ANXA2', 'ANXA4', 'APOA1', 'APOC1', 'APOD', 'APOE', 'APP', 'AQP3', 'AR', 'AREG', 'ARF1', 'ARG1', 'ARHGDIB', 'ARID5B', 'ATF3', 'ATG10', 'ATG12', 'ATG5', 'ATM', 'ATP5F1E', 'ATR', 'AXL', 'AZGP1', 'AZU1', 'B2M', 'B3GNT7', 'BAG3', 'BAX', 'BBLN', 'BCL2', 'BCL2L1', 'BECN1', 'BEST1', 'BGN', 'BID', 'BIRC5', 'BMP1', 'BMP2', 'BMP3', 'BMP4', 'BMP5', 'BMP7', 'BMPR1A', 'BMPR2', 'BRCA1', 'BST1', 'BST2', 'BTF3', 'BTG1', 'BTK', 'C11orf96', 'C1QA', 'C1QB', 'C1QC', 'C5AR2', 'CACNA1C', 'CALB1', 'CALD1', 'CALM1', 'CALM2', 'CALM3', 'CAMP', 'CARMN', 'CASP3', 'CASP8', 'CASR', 'CAV1', 'CCL11', 'CCL13', 'CCL15', 'CCL18', 'CCL19', 'CCL2', 'CCL20', 'CCL21', 'CCL26', 'CCL28', 'CCL3/L1/L3', 'CCL4/L1/L2', 'CCL5', 'CCL8', 'CCND1', 'CCR1', 'CCR10', 'CCR2', 'CCR5', 'CCR7', 'CCRL2', 'CD14', 'CD163', 'CD164', 'CD19', 'CD2', 'CD209', 'CD24', 'CD27', 'CD274', 'CD276', 'CD28', 'CD300A', 'CD33', 'CD34', 'CD36', 'CD37', 'CD38', 'CD3D', 'CD3E', 'CD3G', 'CD4', 'CD40', 'CD40LG', 'CD44', 'CD47', 'CD48', 'CD52', 'CD53', 'CD55', 'CD58', 'CD59', 'CD5L', 'CD63', 'CD68', 'CD69', 'CD70', 'CD74', 'CD79A', 'CD80', 'CD81', 'CD83', 'CD84', 'CD86', 'CD8A', 'CD8B', 'CD9', 'CDH1', 'CDH11', 'CDH19', 'CDH5', 'CDKN1A', 'CDKN3', 'CEACAM1', 'CEACAM6', 'CELSR1', 'CELSR2', 'CENPF', 'CFD', 'CFLAR', 'CHEK1', 'CHEK2', 'CHI3L1', 'CIDEA', 'CIITA', 'CLCF1', 'CLDN4', 'CLEC10A', 'CLEC12A', 'CLEC14A', 'CLEC1A', 'CLEC2B', 'CLEC2D', 'CLEC4A', 'CLEC4D', 'CLEC4E', 'CLEC5A', 'CLEC7A', 'CLOCK', 'CLU', 'CMKLR1', 'CNTFR', 'COL11A1', 'COL12A1', 'COL14A1', 'COL15A1', 'COL16A1', 'COL17A1', 'COL18A1', 'COL1A1', 'COL1A2', 'COL21A1', 'COL27A1', 'COL3A1', 'COL4A1', 'COL4A2', 'COL4A5', 'COL5A1', 'COL5A2', 'COL5A3', 'COL6A1', 'COL6A2', 'COL6A3', 'COL8A1', 'COL9A2', 'COL9A3', 'COTL1', 'CPA3', 'CPB1', 'CRIP1', 'CRP', 'CRYAB', 'CSF1', 'CSF1R', 'CSF2', 'CSF2RA', 'CSF2RB', 'CSF3', 'CSF3R', 'CSHL1', 'CSK', 'CST7', 'CTLA4', 'CTNNB1', 'CTSG', 'CTSW', 'CUZD1', 'CX3CL1', 'CX3CR1', 'CXCL1/2/3', 'CXCL10', 'CXCL12', 'CXCL14', 'CXCL16', 'CXCL17', 'CXCL5', 'CXCL8', 'CXCL9', 'CXCR1', 'CXCR2', 'CXCR3', 'CXCR4', 'CXCR5', 'CXCR6', 'CYP1B1', 'CYP2U1', 'CYSTM1', 'CYTOR', 'DCN', 'DDC', 'DDIT3', 'DDR1', 'DDR2', 'DDX58', 'DHRS2', 'DLL1', 'DLL4', 'DMBT1', 'DNMT1', 'DNMT3A', 'DPP4', 'DST', 'DUSP1', 'DUSP2', 'DUSP4', 'DUSP5', 'DUSP6', 'EFNA1', 'EFNA4', 'EFNA5', 'EFNB1', 'EFNB2', 'EGF', 'EGFR', 'EIF5A/L1', 'ELANE', 'EMP3', 'ENG', 'ENO1', 'ENTPD1', 'EOMES', 'EPCAM', 'EPHA2', 'EPHA3', 'EPHA4', 'EPHA7', 'EPHB2', 'EPHB3', 'EPHB4', 'EPHB6', 'EPOR', 'ERBB2', 'ERBB3', 'ESAM', 'ESR1', 'ETS1', 'ETV4', 'ETV5', 'EZH2', 'EZR', 'FABP4', 'FABP5', 'FAM30A', 'FAS', 'FASLG', 'FASN', 'FAU', 'FCER1G', 'FCGBP', 'FCGR3A/B', 'FCRLA', 'FES', 'FFAR2', 'FFAR3', 'FFAR4', 'FGF1', 'FGF12', 'FGF13', 'FGF18', 'FGF2', 'FGF7', 'FGF9', 'FGFR1', 'FGFR2', 'FGFR3', 'FGG', 'FGR', 'FHIT', 'FKBP11', 'FKBP5', 'FLT1', 'FLT3LG', 'FN1', 'FOS', 'FOXF1', 'FOXP3', 'FPR1', 'FYB1', 'FYN', 'FZD1', 'FZD3', 'FZD4', 'FZD5', 'FZD6', 'FZD7', 'FZD8', 'G6PD', 'GADD45B', 'GAS6', 'GATA3', 'GC', 'GCG', 'GDF15', 'GLUD1', 'GLUL', 'GNLY', 'GPBAR1', 'GPER1', 'GPNMB', 'GPR183', 'GPX1', 'GPX3', 'GSN', 'GSTP1', 'GZMA', 'GZMB', 'GZMH', 'GZMK', 'H2AZ1', 'H4C3', 'HAVCR2', 'HBA1/2', 'HBB', 'HCAR2/3', 'HCK', 'HCST', 'HDAC1', 'HDAC11', 'HDAC3', 'HDAC4', 'HDAC5', 'HEY1', 'HGF', 'HIF1A', 'HILPDA', 'HLA-DPA1', 'HLA-DPB1', 'HLA-DQA1', 'HLA-DQB1/2', 'HLA-DRA', 'HLA-DRB', 'HMGB2', 'HMGN2', 'HPGDS', 'HSD17B2', 'HSP90AA1', 'HSP90AB1', 'HSP90B1', 'HSPA1A/B', 'HSPB1', 'HTT', 'IAPP', 'ICA1', 'ICAM1', 'ICAM2', 'ICAM3', 'ICOS', 'ICOSLG', 'IDO1', 'IER3', 'IFI27', 'IFI44L', 'IFIH1', 'IFIT1', 'IFIT3', 'IFITM1', 'IFITM3', 'IFNA1/13', 'IFNAR1', 'IFNAR2', 'IFNG', 'IFNGR1', 'IFNGR2', 'IFNL2/3', 'IGF1', 'IGF1R', 'IGF2', 'IGF2R', 'IGFBP3', 'IGFBP5', 'IGFBP6', 'IGFBP7', 'IGHA1', 'IGHD', 'IGHG1', 'IGHG2', 'IGHM', 'IGKC', 'IKZF3', 'IL10', 'IL10RA', 'IL10RB', 'IL11', 'IL11RA', 'IL12A', 'IL12B', 'IL12RB1', 'IL12RB2', 'IL13RA1', 'IL15', 'IL15RA', 'IL16', 'IL17A', 'IL17B', 'IL17D', 'IL17RA', 'IL17RB', 'IL17RE', 'IL18', 'IL18R1', 'IL1A', 'IL1B', 'IL1R1', 'IL1R2', 'IL1RAP', 'IL1RL1', 'IL1RN', 'IL2', 'IL20', 'IL20RA', 'IL22RA1', 'IL23A', 'IL24', 'IL27RA', 'IL2RA', 'IL2RB', 'IL2RG', 'IL32', 'IL33', 'IL34', 'IL36G', 'IL3RA', 'IL4R', 'IL6', 'IL6R', 'IL6ST', 'IL7', 'IL7R', 'INHA', 'INHBA', 'INHBB', 'INS', 'INSR', 'IRF3', 'IRF4', 'ITGA1', 'ITGA2', 'ITGA3', 'ITGA5', 'ITGA6', 'ITGA8', 'ITGA9', 'ITGAE', 'ITGAL', 'ITGAM', 'ITGAV', 'ITGAX', 'ITGB1', 'ITGB2', 'ITGB4', 'ITGB5', 'ITGB6', 'ITGB8', 'ITK', 'ITM2A', 'JAG1', 'JAK1', 'JAK2', 'JCHAIN', 'JUN', 'JUNB', 'KDR', 'KIT', 'KITLG', 'KLF2', 'KLK3', 'KLRB1', 'KLRF1', 'KLRK1', 'KRAS', 'KRT1', 'KRT10', 'KRT13', 'KRT14', 'KRT15', 'KRT16', 'KRT17', 'KRT18', 'KRT19', 'KRT20', 'KRT23', 'KRT4', 'KRT5', 'KRT6A/B/C', 'KRT7', 'KRT8', 'KRT80', 'KRT86', 'LAG3', 'LAIR1', 'LAMP2', 'LAMP3', 'LCN2', 'LDB2', 'LDHA', 'LDLR', 'LEFTY1', 'LEP', 'LGALS1', 'LGALS3', 'LGALS3BP', 'LGALS9', 'LGR5', 'LIF', 'LIFR', 'LINC01781', 'LINC01857', 'LINC02446', 'LMNA', 'LMNB1', 'LPAR5', 'LTB', 'LTBR', 'LTF', 'LUM', 'LY6D', 'LY75', 'LYN', 'LYZ', 'MAF', 'MALAT1', 'MAML2', 'MAP1LC3B/2', 'MAPK13', 'MAPK14', 'MARCO', 'MB', 'MECOM', 'MEG3', 'MERTK', 'MET', 'MFAP5', 'MGP', 'MHC I', 'MIF', 'MIR4435-2HG', 'MKI67', 'MMP1', 'MMP12', 'MMP14', 'MMP19', 'MMP2', 'MMP7', 'MMP9', 'MPO', 'MRC1', 'MRC2', 'MS4A1', 'MS4A4A', 'MS4A6A', 'MSMB', 'MSR1', 'MST1R', 'MT1X', 'MT2A', 'MTOR', 'MUC5AC', 'MX1', 'MXRA8', 'MYC', 'MYH11', 'MYH6', 'MYL12A', 'MYL4', 'MYL7', 'MYL9', 'MZB1', 'MZT2A/B', 'NACA', 'NANOG', 'NCR1', 'NDRG1', 'NEAT1', 'NELL2', 'NFKB1', 'NFKBIA', 'NGFR', 'NKG7', 'NLRC4', 'NLRC5', 'NLRP1', 'NLRP2', 'NLRP3', 'NOD2', 'NOSIP', 'NOTCH1', 'NOTCH2', 'NOTCH3', 'NPPC', 'NPR1', 'NPR2', 'NPR3', 'NR1H2', 'NR1H3', 'NR3C1', 'NRG1', 'NRXN1', 'NRXN3', 'NTRK2', 'NUSAP1', 'OAS1', 'OAS2', 'OAS3', 'OASL', 'OLFM4', 'OLR1', 'OSM', 'OSMR', 'P2RX5', 'PARP1', 'PCNA', 'PDCD1', 'PDCD1LG2', 'PDGFA', 'PDGFB', 'PDGFC', 'PDGFD', 'PDGFRA', 'PDGFRB', 'PDS5A', 'PECAM1', 'PF4/V1', 'PFN1', 'PGF', 'PGR', 'PHLDA2', 'PIGR', 'PLAC8', 'PLAC9', 'PNOC', 'POU5F1', 'PPARA', 'PPARD', 'PPARG', 'PPIA', 'PRF1', 'PRSS2', 'PRTN3', 'PSAP', 'PSCA', 'PSD3', 'PTGDR2', 'PTGDS', 'PTGES', 'PTGES2', 'PTGES3', 'PTGIS', 'PTGS1', 'PTGS2', 'PTK2', 'PTK6', 'PTPRC', 'PTPRCAP', 'PTTG1', 'QRFPR', 'RAC1', 'RAC2', 'RACK1', 'RAG1', 'RAMP1', 'RAMP2', 'RAMP3', 'RARA', 'RARB', 'RARG', 'RARRES1', 'RARRES2', 'RB1', 'RBM47', 'RBPJ', 'REG1A', 'RELA', 'RELT', 'RGCC', 'RGS1', 'RGS2', 'RGS5', 'RNF43', 'ROR1', 'RORA', 'RPL21', 'RPL22', 'RPL32', 'RPL34', 'RPL37', 'RPS4Y1', 'RSPO3', 'RUNX3', 'RXRA', 'RXRB', 'RYK', 'RYR2', 'S100A10', 'S100A2', 'S100A4', 'S100A6', 'S100A8', 'S100A9', 'S100B', 'S100P', 'SAA1/2', 'SARS-COV-2 N', 'SAT1', 'SCG5', 'SCGB3A1', 'SEC23A', 'SEC61G', 'SELENOP', 'SELL', 'SELPLG', 'SERPINA1', 'SERPINA3', 'SERPINB5', 'SERPINH1', 'SFN', 'SFTPB', 'SFTPC', 'SH3BGRL3', 'SIGIRR', 'SLC2A1', 'SLC40A1', 'SLPI', 'SMAD2', 'SMAD3', 'SMAD4', 'SMARCB1', 'SMO', 'SNAI1', 'SNAI2', 'SOD1', 'SOD2', 'SORBS1', 'SOSTDC1', 'SOX2', 'SOX4', 'SOX9', 'SPARCL1', 'SPINK1', 'SPOCK2', 'SPP1', 'SPRY2', 'SPRY4', 'SQSTM1', 'SRC', 'SREBF1', 'SRGN', 'SST', 'ST6GAL1', 'ST6GALNAC3', 'STAT1', 'STAT3', 'STAT4', 'STAT5A', 'STAT5B', 'STAT6', 'STMN1', 'SYK', 'TACSTD2', 'TAGLN', 'TAP1', 'TAP2', 'TBX21', 'TCAP', 'TCF7', 'TCL1A', 'TEK', 'TFEB', 'TGFB1', 'TGFB2', 'TGFB3', 'TGFBR1', 'TGFBR2', 'THBS1', 'THBS2', 'THSD4', 'TIE1', 'TIGIT', 'TIMP1', 'TLR1', 'TLR2', 'TLR3', 'TLR4', 'TLR5', 'TLR7', 'TLR8', 'TM4SF1', 'TNF', 'TNFAIP6', 'TNFRSF10A', 'TNFRSF10B', 'TNFRSF10D', 'TNFRSF11A', 'TNFRSF11B', 'TNFRSF12A', 'TNFRSF13B', 'TNFRSF14', 'TNFRSF17', 'TNFRSF18', 'TNFRSF19', 'TNFRSF1A', 'TNFRSF1B', 'TNFRSF21', 'TNFRSF4', 'TNFRSF9', 'TNFSF10', 'TNFSF12', 'TNFSF13B', 'TNFSF14', 'TNFSF15', 'TNFSF4', 'TNFSF8', 'TNFSF9', 'TNNC1', 'TNNT2', 'TNXA/B', 'TOP2A', 'TOX', 'TP53', 'TP53BP1', 'TPM1', 'TPM2', 'TPSAB1/B2', 'TPT1', 'TSC22D1', 'TSHZ2', 'TTN', 'TTR', 'TUBA1A', 'TUBB', 'TUBB4B', 'TWIST1', 'TWIST2', 'TXK', 'TYK2', 'TYMS', 'TYROBP', 'UBA52', 'UBE2C', 'UPK3A', 'VCAM1', 'VCAN', 'VEGFA', 'VEGFB', 'VEGFC', 'VEGFD', 'VHL', 'VIM', 'VPREB3', 'VSIR', 'VTN', 'VWA1', 'VWF', 'WIF1', 'WNT10B', 'WNT11', 'WNT3', 'WNT5A', 'WNT5B', 'WNT7A', 'WNT7B', 'WNT9A', 'XBP1', 'XCL1/2', 'XKR4', 'YBX3', 'YES1', 'ZFP36'];

var GLB_GENES_UPPER = [];
var GLB_MULTI_INPUTTED_GENES = null;
var GLB_EMAIL_OK = false;

debug_log(GLB_ALL_GENES.length);


function debug_log(msg){
    console.log(msg);
}


function init_fov_data(){
    for (var key in GLB_FOV_DATA){
        var item = GLB_FOV_DATA[key];
        var condition = item['condition'];
        var patient = item['patient'];
        if(GLB_1ST_LEVEL[condition] === undefined){
            GLB_1ST_LEVEL[condition] = [];
        }
        if(GLB_1ST_LEVEL[condition].indexOf(patient) === -1){
            GLB_1ST_LEVEL[condition].push(patient);
        }
        if(GLB_2ND_LEVEL[patient] === undefined){
            GLB_2ND_LEVEL[patient] = [];
        }
        if(GLB_2ND_LEVEL[patient].indexOf(key) === -1){
            GLB_2ND_LEVEL[patient].push(key);
        }
    }
    debug_log(GLB_1ST_LEVEL);
    debug_log(GLB_2ND_LEVEL);

    for (var i=0; i<GLB_ALL_GENES.length; i++){
        // here ignore all spaces, also ignore spaces in user's input, handle this in backend
        // use , to separate
        GLB_GENES_UPPER.push(replace_all(GLB_ALL_GENES[i], ' ', '').toUpperCase());
    }
    // debug_log(GLB_GENES_UPPER);
}

function sample_shown_to_inner() {
    var data= `COVID-A_#01 CO01
COVID-A_#02 CO02
COVID-A_#03 CO03
COVID-A_#04 CO05
COVID-A_#05 CO07
COVID-A_#06 CO12
COVID-A_#07 CO16
COVID-A_#08 CO19
COVID-A_#09 CO20
COVID-A_#10 CO21
COVID-E_#01 COE01
COVID-E_#02 COE02
COVID-E_#03 COE04
COVID-E_#04 COE05
COVID-E_#05 COE06
COVID-E_#06 COE07
non-COVID_#01 H02
non-COVID_#02 H03
non-COVID_#03 H05
non-COVID_#04 H06
non-COVID_#05 H08
non-COVID_#06 H09`;
    var lines = data.split('\n');
    var dict = {};
    for (var i=0; i<lines.length; i++){
        var line = lines[i];
        var parts = line.split(' ');
        var left = parts[0];
        var right = parts[1];
        dict[left] = right;
    }
    return dict;
}

function sample_inner_to_shown() {
    var data= `COVID-A_#01 CO01
COVID-A_#02 CO02
COVID-A_#03 CO03
COVID-A_#04 CO05
COVID-A_#05 CO07
COVID-A_#06 CO12
COVID-A_#07 CO16
COVID-A_#08 CO19
COVID-A_#09 CO20
COVID-A_#10 CO21
COVID-E_#01 COE01
COVID-E_#02 COE02
COVID-E_#03 COE04
COVID-E_#04 COE05
COVID-E_#05 COE06
COVID-E_#06 COE07
non-COVID_#01 H02
non-COVID_#02 H03
non-COVID_#03 H05
non-COVID_#04 H06
non-COVID_#05 H08
non-COVID_#06 H09`;
    var lines = data.split('\n');
    var dict = {};
    for (var i=0; i<lines.length; i++){
        var line = lines[i];
        var parts = line.split(' ');
        var left = parts[0];
        var right = parts[1];
        dict[right] = left;
    }
    return dict;
}


function create_3rd_callbacks(){
    var elements = document.querySelectorAll('#fov-fov > div > a');
    var fov_text = document.getElementById('fov-text');
    for (var i=0; i<elements.length; i++){
        elements[i].addEventListener('click', function(){
            fov_text.innerHTML = this.innerHTML;
        });
    }
}


function create_2nd_callbacks(){
    var elements = document.querySelectorAll('#fov-sample > div > a');
    var sample_text = document.getElementById('sample-text');
    for (var i=0; i<elements.length; i++){
        elements[i].addEventListener('click', function(){
            if(this.innerHTML === sample_text.innerHTML){
                return;
            }
            sample_text.innerHTML = this.innerHTML;
            var patient = sample_shown_to_inner()[this.innerHTML];
            var fovs = GLB_2ND_LEVEL[patient];
            var fov_container = document.querySelector('#fov-fov > div');
            fov_container.innerHTML = '';
            for (var i=0; i<fovs.length; i++){
                var a = document.createElement('a');
                a.innerHTML = fovs[i].replace('_', ', ');
                fov_container.appendChild(a);
            }
            document.getElementById('fov-fov').style.display = 'block';
            document.getElementById('fov-text').style.display = 'block';
            document.getElementById('fov-text').innerHTML = 'None';
            create_3rd_callbacks();
        });
    }
}


function create_1st_callbacks(){
    var elements = document.querySelectorAll('#fov-condition > div > a');
    var condition_text = document.getElementById('condition-text');
    for (var i=0; i<elements.length; i++){
        elements[i].addEventListener('click', function(){
            if(this.innerHTML === condition_text.innerHTML){
                return;
            }
            condition_text.innerHTML = this.innerHTML;
            var condition = this.innerHTML;
            var patients = GLB_1ST_LEVEL[condition];
            var patients_sorted = [];
            patients_sorted = JSON.parse(JSON.stringify(patients));
            patients_sorted.sort();
            var patient_container = document.querySelector('#fov-sample > div');
            patient_container.innerHTML = '';
            for (var i=0; i<patients.length; i++){
                var a = document.createElement('a');
                a.innerHTML = sample_inner_to_shown()[patients_sorted[i]];
                patient_container.appendChild(a);
            }
            document.getElementById('fov-sample').style.display = 'block';
            document.getElementById('sample-text').style.display = 'block';
            document.getElementById('sample-text').innerHTML = 'None';
            document.getElementById('fov-text').innerHTML = 'None';
            document.getElementById('fov-fov').style.display = 'none';
            document.getElementById('fov-text').style.display = 'none';
            create_2nd_callbacks();
        });
    }
}


function init_buttons(){
    var condition_container = document.querySelector('#fov-condition > div');
    for (var condition in GLB_1ST_LEVEL){
        var a = document.createElement('a');
        a.innerHTML = condition;
        condition_container.appendChild(a);
    }
    create_1st_callbacks();

    var genes_container = document.querySelector('#fov-gene > div');
    for (var i=0; i<GLB_ALL_GENES.length; i++){
        var a = document.createElement('a');
        a.innerHTML = GLB_ALL_GENES[i];
        genes_container.appendChild(a);
    }
    var genes = document.querySelectorAll('#fov-gene > div > a');
    for (var i=0; i<genes.length; i++){
        genes[i].addEventListener('click', function(){
            var gene_text = document.getElementById('gene-text');
            gene_text.innerHTML = this.innerHTML;
        });
    }
}

function init_selection() {
    var id = window.location.hash;
    if (id.indexOf('#') === -1){
        return;
    }
    id = id.substring(id.indexOf('#')+1);
    try {
        if (id.indexOf('S') === -1){
            window.location.hash = '';
            return;
        }
        var id_parts = id.split('_');
        id = id_parts[1] + '_' + id_parts[0];
        if (GLB_FOV_DATA[id] === undefined){
            window.location.hash = '';
            return;
        }
    } catch (e) {
        window.location.hash = '';
        return;
    }
    debug_log(id);
    window.location.hash = '';
    var condition = GLB_FOV_DATA[id]['condition'];
    var patient = GLB_FOV_DATA[id]['patient'];
    patient = sample_inner_to_shown()[patient];
    var as = document.querySelectorAll('#fov-condition > div > a');
    for (var i=0; i<as.length; i++){
        if(as[i].innerHTML === condition){
            as[i].click();
            break;
        }
    }
    as = document.querySelectorAll('#fov-sample > div > a');
    for (var i=0; i<as.length; i++){
        if(as[i].innerHTML === patient){
            as[i].click();
            break;
        }
    }
    var fov_name = id.replace('_', ', ');
    as = document.querySelectorAll('#fov-fov > div > a');
    for (var i=0; i<as.length; i++){
        if(as[i].innerHTML === fov_name){
            as[i].click();
            break;
        }
    }
}

window.addEventListener('DOMContentLoaded', function(){
    var conditions = document.querySelectorAll('#fov-gene-op > div > a');
    var condition_text = document.getElementById('gene-op-text');
    for (var i = 0; i < conditions.length; i++) {
        conditions[i].addEventListener('click', function(){
            if(this.innerHTML === condition_text.innerHTML){
                return;
            }
            condition_text.innerHTML = this.innerHTML;
            var multi_elements = document.getElementsByClassName('in-multi-genes');
            var dis = 'none';
            if(this.innerHTML.startsWith('Mul')){
                dis = 'block';
            }
            var dis2 = 'none';
            if(this.innerHTML.startsWith('Single')){
                dis2 = 'block';
            }
            for (var i=0; i<multi_elements.length;i++){
                multi_elements[i].style.display = dis;
            }
            document.getElementById('fov-gene').style.display = dis2;
            document.getElementById('gene-text').style.display = dis2;
        });
    }
});


function replace_all(string, a, b) {
    return string.split(a).join(b);
}

function stringToHex(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let hex = '';
    for (let byte of bytes) {
        hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
}


window.addEventListener('DOMContentLoaded', function(){
    var submit = document.getElementById('fov-submit');
    submit.addEventListener('click', function(){
        var gene_option = document.getElementById('gene-op-text').innerHTML;
        var img = document.querySelector('#img-container > img');
        if (gene_option.startsWith('Mul')){
            document.querySelector('#img-container > p').className = '';
            // img.src = '';
            update_img('');
            img.style.display = 'none';
            var text_elemant = document.querySelector('#img-container > p');
            text_elemant.innerHTML = '';
            text_elemant.style.display = 'block';
            var err_msg = '';
            var condition = document.getElementById('condition-text').innerHTML;
            var sample = document.getElementById('sample-text').innerHTML;
            var fov = document.getElementById('fov-text').innerHTML;
            if (condition === "None") {
                err_msg += 'Please select condition, sample, and FOV. ';
            } else if (sample === "None") {
                err_msg += 'Please select sample and FOV. ';
            } else if (fov === "None") {
                err_msg += 'Please select FOV. ';
            }
            if (GLB_MULTI_INPUTTED_GENES === null) {
                err_msg += 'Genes input is not valid. ';
            }
            if (GLB_MULTI_INPUTTED_GENES !== null && GLB_MULTI_INPUTTED_GENES.length === 2 && GLB_MULTI_INPUTTED_GENES[0] === GLB_MULTI_INPUTTED_GENES[1]){
                err_msg += 'Genes cannot be duplicated. ';
            }
            if (GLB_MULTI_INPUTTED_GENES !== null && GLB_MULTI_INPUTTED_GENES.length === 3 && (GLB_MULTI_INPUTTED_GENES[0] === GLB_MULTI_INPUTTED_GENES[1] || GLB_MULTI_INPUTTED_GENES[0] === GLB_MULTI_INPUTTED_GENES[2] || GLB_MULTI_INPUTTED_GENES[1] === GLB_MULTI_INPUTTED_GENES[2])){
                err_msg += 'Genes cannot be duplicated. ';
            }
            if (GLB_EMAIL_OK === false){
                err_msg += 'Email is not valid. ';
            }
            if (err_msg !== ''){
                text_elemant.innerHTML = err_msg;
                return;
            }
            text_elemant.innerHTML = 'Submitting ......';
            text_elemant.classList.add('black');
            var json_data = {
                sample: sample_shown_to_inner()[sample],
                fov: fov.split(',')[0],
                genes: GLB_MULTI_INPUTTED_GENES,
                email: document.getElementById('multi-gene-email').value
            };
            json_data = JSON.stringify(json_data);
            debug_log(json_data);
            json_data = stringToHex(json_data);
            var url = GLB_API_SERVER_URL + '/email_multi/' + json_data;
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.timeout = 10000;
            request.responseType = 'text';
            request.onload = function() {
                if (request.status === 202) {
                    text_elemant.className = '';
                    text_elemant.classList.add('green');
                    text_elemant.innerHTML = 'Submitted successfully, please check your email later.';
                    return;
                }
                text_elemant.className = '';
                text_elemant.classList.add('red');
                if (request.status === 400) {
                    text_elemant.innerHTML = 'Error: ' + request.responseText;
                    return;
                }
                text_elemant.innerHTML = `Error: HTTP ${request.status}`;
            }
            request.ontimeout = function(){
                text_elemant.className = '';
                text_elemant.classList.add('red');
                text_elemant.innerHTML = 'Error: Timeout';
            }
            request.onerror = function(){
                text_elemant.className = '';
                text_elemant.classList.add('red');
                text_elemant.innerHTML = 'Error: Network error';
            }
            // request.send();
            send_request(request);
            return;
        }
        document.querySelector('#img-container > p').className = '';
        var err_msg = '';
        var condition = document.getElementById('condition-text').innerHTML;
        var sample = document.getElementById('sample-text').innerHTML;
        var fov = document.getElementById('fov-text').innerHTML;
        if (condition === "None") {
            err_msg += 'Please select condition, sample, and FOV. ';
        } else if (sample === "None") {
            err_msg += 'Please select sample and FOV. ';
        } else if (fov === "None") {
            err_msg += 'Please select FOV. ';
        }
        sample = sample_shown_to_inner()[sample];
        var gene = document.getElementById('gene-text').innerHTML;
        if (gene_option.startsWith('Single') && gene === 'None'){
            err_msg += 'Please select a gene. ';
        }
        if(err_msg !== ''){
            // img.src = '';
            update_img('');
            document.querySelector('#img-container > p').innerHTML = err_msg;
            img.style.display = 'none';
            document.querySelector('#img-container > p').style.display = 'block';
            return;
        }
        img.style.display = 'block';
        document.querySelector('#img-container > p').style.display = 'none';
        gene = replace_all(gene, '/', '.');
        gene = replace_all(gene, ' ', '@');
        fov = fov.split(',')[0];
        var link = `/02.images/${sample}/${sample}.${fov}.png`;
        if (gene_option.startsWith('Single')){
            link = `/02.images/${sample}/${sample}.${fov}.${gene}.png`;
        }
        // img.src = '';
        update_img('');
        // img.src = GLB_DATA_SERVER_URL + link;
        update_img(GLB_DATA_SERVER_URL + link);
    });
})

window.addEventListener('DOMContentLoaded', function(){
    var genes_input = document.getElementById('multi-gene-input');
    genes_input.addEventListener('input', function(){
        var text = genes_input.value;
        // debug_log(text);
        text = text.toUpperCase();
        text = replace_all(text, ' ', '');
        var genes_tmp = text.split(',');
        var genes = [];
        for (var i=0; i<genes_tmp.length; i++) {
            if(genes_tmp[i] !== ''){
                genes.push(genes_tmp[i]);
            }
        }
        // debug_log(genes);
        var total_num = genes.length;
        if (total_num === 0){
            GLB_MULTI_INPUTTED_GENES = null;
            document.getElementById('multi-input-msg').innerHTML = '';
            document.getElementById('too-much-genes').innerHTML = '';
            document.getElementById('multi-gene-input').classList.remove('too-much');
            document.getElementById('multi-gene-input').classList.remove('ok');
            return;
        }
        var valid_num = 0;
        for (var i=0; i<genes.length; i++){
            if(GLB_GENES_UPPER.indexOf(genes[i]) !== -1){
                valid_num++;
            }
        }
        // don't check duplicate here, check when submit
        if (total_num === valid_num && valid_num <= 3 && valid_num >= 2){
            GLB_MULTI_INPUTTED_GENES = genes;
            document.getElementById('multi-input-msg').innerHTML = `${valid_num} / ${total_num} matched`;
            document.getElementById('multi-input-msg').style.color = 'green';
            document.getElementById('too-much-genes').innerHTML = '';
            document.getElementById('multi-gene-input').classList.remove('too-much');
            document.getElementById('multi-gene-input').classList.add('ok');
        } else {
            GLB_MULTI_INPUTTED_GENES = null;
            document.getElementById('multi-input-msg').innerHTML = `${valid_num} / ${total_num} matched`;
            // handle two texts separately
            if (valid_num === total_num) {
                document.getElementById('multi-input-msg').style.color = 'green';
            } else {
                document.getElementById('multi-input-msg').style.color = 'red';
            }
            if (total_num > 3){
                document.getElementById('multi-gene-input').classList.remove('ok');
                document.getElementById('multi-gene-input').classList.add('too-much');
                document.getElementById('too-much-genes').innerHTML = 'at most 3 genes are allowed';
            } else if (total_num < 2){
                document.getElementById('multi-gene-input').classList.remove('ok');
                document.getElementById('multi-gene-input').classList.add('too-much');
                document.getElementById('too-much-genes').innerHTML = 'at least 2 genes are required';
            } else {
                document.getElementById('multi-gene-input').classList.remove('ok');
                document.getElementById('multi-gene-input').classList.remove('too-much');
                document.getElementById('too-much-genes').innerHTML = '';
            }
        }
    });


    document.getElementById('multi-gene-email').addEventListener('input', function(){
        var email = document.getElementById('multi-gene-email').value;
        if (email === ''){
            GLB_EMAIL_OK = false;
            document.getElementById('multi-gene-email').classList.remove('ok');
            document.getElementById('multi-gene-email').classList.remove('invalid');
            return;
        }
        if (/^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]+$/.test(email)){
            GLB_EMAIL_OK = true;
            document.getElementById('multi-gene-email').classList.add('ok');
            document.getElementById('multi-gene-email').classList.remove('invalid');
        } else {
            GLB_EMAIL_OK = false;
            document.getElementById('multi-gene-email').classList.remove('ok');
            document.getElementById('multi-gene-email').classList.add('invalid');
        }
    });
});

debug_log(Object.keys(GLB_FOV_DATA).length);
init_fov_data();
window.addEventListener('DOMContentLoaded', function(){
    init_buttons();
    init_selection();
});




var GLB_IMG_URL = '';

function update_img(url) {
    GLB_IMG_URL = url;
    img_sync();
}


function img_sync(){
    if (document.querySelector('#img-container > img').src === GLB_IMG_URL){
        return;
    }
    document.querySelector('#img-container > img').src = GLB_IMG_URL;
}


function check_img(){
    setTimeout(check_img, 50);
    img_sync();
}

function send_request(request){
    request.send();
}

window.addEventListener('DOMContentLoaded', function(){
    check_img();
});

