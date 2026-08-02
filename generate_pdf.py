import os
import json
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa

def jana_laporan_pdf():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(BASE_DIR, 'data.json')

    # Read dynamic data sent from React & Express
    if os.path.exists(data_path):
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        # Fallback dummy data jika fail tiada
        data = {
            "tajuk_laporan": "LAPORAN SENARAI GURU",
            "tarikh": "1 Ogos 2026",
            "nama_sekolah": "SMK Sri Indah",
            "senarai_guru": []
        }

    env = Environment(loader=FileSystemLoader(BASE_DIR))
    template = env.get_template('template.html')

    html_out = template.render(data)

    nama_fail_pdf = os.path.join(BASE_DIR, "Laporan_Guru_2026.pdf")
    with open(nama_fail_pdf, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(html_out, dest=pdf_file)

    if not pisa_status.err:
        print(f"Berjaya! Fail PDF telah dijana di: {nama_fail_pdf}")
    else:
        print("Ralat semasa menjana PDF.")

if __name__ == "__main__":
    jana_laporan_pdf()