from typing import Tuple
import json
import re
from mySecrets import hexToStr
import traceback
import fitz  # PyMuPDF
from R_http import fov_multi
from my_email import send_email
from all_genes import ALL_GENES as ALL_GENES
from fov_info import FOV_INFO as FOV_INFO

GENES_FORMATTED_TO_ORIGIN = {}
CELL_TYPES = ['0:LC-1', '1:Macro', '2:Fibro', '3:SMC', '4:Endo', '5:AT2', '6:Mono', '7:Plasma', '8:RBC', '9:LC-2', '10:AT1', '11:Basal', '12:Nutrophil', '13:Unknown']


for i in range(0, len(ALL_GENES)):
    this_name = ALL_GENES[i]
    formatted_name = ALL_GENES[i].replace(' ', '').upper()
    GENES_FORMATTED_TO_ORIGIN[formatted_name] = this_name


SAMPLE_FOV_TO_SLIDE = {}

for fov_slide in FOV_INFO:
    fov, slide_num = fov_slide.split('_')
    fov = int(fov)
    slide_num = int(slide_num[1:])
    sample = FOV_INFO[fov_slide]['patient']
    SAMPLE_FOV_TO_SLIDE[(sample, fov)] = slide_num


def convert_input(data: str) -> Tuple[bool, str, Tuple[str, str, int, str, str]]:
    '''
    Convert user input format to R code format
    
    Output: (success, message, (slide, sample, fov, genes, email))
    '''
    try:
        data = hexToStr(data)
        data = json.loads(data)
        sample = data['sample']
        fov = data['fov']
        genes = data['genes']
        email = data['email']
        assert (type(sample) == str)
        assert (type(fov) == str)
        assert (type(genes) == list)
        assert (type(email) == str)
        assert (len(genes) in (2, 3))
        assert (re.match(r'^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]+$', email))
        fov_num = int(fov)
        assert (str(fov_num) == fov)
        slide_num = SAMPLE_FOV_TO_SLIDE[(sample, fov_num)]
        my_genes = []
        for g in genes:
            assert (type(g) == str)
            assert (g in GENES_FORMATTED_TO_ORIGIN)
            my_genes.append(GENES_FORMATTED_TO_ORIGIN[g])
        if (len(my_genes) == 2):
            assert (my_genes[0] != my_genes[1])
        if (len(my_genes) == 3):
            assert (my_genes[0] != my_genes[1])
            assert (my_genes[1] != my_genes[2])
            assert (my_genes[0] != my_genes[2])
    except Exception as err:
        err_msg = traceback.format_exc()
        return (False, str(err_msg), ())
    slide = f'S7280.{slide_num}'
    sample = sample
    fov_num = fov_num
    my_genes.sort()
    genes = ','.join(my_genes)
    return (True, '', (slide, sample, fov_num, genes, email))
    



def binary_to_str(data: bytes) -> str:
    try:
        return data.decode('utf-8')
    except:
        return str(data)[2:-1]


def pdf_to_png_bytes(pdf_path, dpi=300):
    document = fitz.open(pdf_path)
    if document.page_count > 0:
        page = document.load_page(0)
        zoom = dpi / 72
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        result = pix.tobytes("png")
        # os.remove(pdf_path)
        return result
    
def R_email_pipe(task_id: str, file_name: str, slide: str, sample: str, fov: int, genes: str, email: str, host: str) -> None:
    R_file_name = './tmp/' + file_name
    python_file_name = '../docker/resources/04.exp_functions/tmp/' + file_name
    png_path = '../tmp/' + task_id + '.png'
    sample_email = sample_inner_to_shown()[sample]
    file_exist = True
    try:
        f = open(png_path, 'rb')
        _ = f.read()
    except:
        file_exist = False
    if (file_exist):
        f.close()
        resp_msg = 'Success, link is: http://' + host + '/api/generated/' + task_id + '.png'
        resp_msg = f'S{slide[-1]}, {fov}, {sample_email}, {genes}\n\n' + resp_msg
        title = 'Result for multi-gene FOV image in COVID-Lung CosMX website'
        try:
            send_email(email, title, resp_msg)
            print('Email sent successfully')
        except:
            print('Email sending failed')
        return
    resp = fov_multi(slide, sample, fov, genes, R_file_name)
    resp_msg = ''
    if (resp[0] == False):
        resp_msg = binary_to_str(resp[1])
        resp_msg = "Error: \n" + resp_msg
    else:
        resp_msg = 'Success, link is: http://' + host + '/api/generated/' + task_id + '.png'
        png_bytes = pdf_to_png_bytes(python_file_name)
        with open(png_path, 'wb') as f:
            f.write(png_bytes)
    title = 'Result for multi-gene FOV image in COVID-Lung CosMX website'
    resp_msg = f'S{slide[-1]}, {fov}, {sample_email}, {genes}\n\n' + resp_msg
    try:
        send_email(email, title, resp_msg)
        print('Email sent successfully')
    except:
        print('Email sending failed')
    

def format_str(text: str) -> str:
    text = text.replace(' ', '').replace('/', '').replace('-', '').replace('.', '')
    return text.lower()

GENES_AI_FORMATTED_TO_ORIGIN = {}
for i in range(0, len(ALL_GENES)):
    this_name = ALL_GENES[i]
    formatted_name = format_str(ALL_GENES[i])
    GENES_AI_FORMATTED_TO_ORIGIN[formatted_name] = this_name


def equals_after_format(str1: str, str2: str) -> bool:
    return (format_str(str1) == format_str(str2))

def find_after_format(list1: list[str], str1: str) -> int:
    for i in range(0, len(list1)):
        if (equals_after_format(list1[i], str1)):
            return i
    return -1

def is_list_str(list1) -> bool:
    if (type(list1) != list):
        return False
    for i in list1:
        if (type(i) != str):
            return False
    return True


def sample_shown_to_inner() -> dict:
    data = '''COVID-A_#01 CO01
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
non-COVID_#06 H09'''
    lines = data.split('\n')
    dict1 = {}
    for i in range(0, len(lines)):
        line = lines[i]
        parts = line.split(' ')
        left = parts[0]
        right = parts[1]
        dict1[left] = right
    return dict1


def sample_inner_to_shown() -> dict:
    data = '''COVID-A_#01 CO01
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
non-COVID_#06 H09'''
    lines = data.split('\n')
    dict1 = {}
    for i in range(0, len(lines)):
        line = lines[i]
        parts = line.split(' ')
        left = parts[0]
        right = parts[1]
        dict1[right] = left
    return dict1