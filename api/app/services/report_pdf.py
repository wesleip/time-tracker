"""Gerador mínimo de PDF para o relatório mensal, sem dependência externa.

Suporta o que a tabela precisa: fontes base Helvetica (WinAnsi), texto, linhas e
quebra de página. Não é um motor de layout — se o relatório ganhar colunas
complexas ou imagens, troque por uma biblioteca (reportlab/fpdf2).
"""
from datetime import datetime
from zoneinfo import ZoneInfo

from app.schemas.report import MonthlyReport

PAGE_W, PAGE_H = 595, 842
MARGIN = 50
BOTTOM = 70
LINE_H = 16
TZ = ZoneInfo("America/Sao_Paulo")

MONTHS = (
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
)
WEEKDAYS = ("seg", "ter", "qua", "qui", "sex", "sáb", "dom")

COL_DATE, COL_WEEKDAY, COL_PROJECT, COL_HOURS = 50, 100, 150, 545


def _escape(text: str) -> str:
    """Escapa para string literal de PDF e converte para bytes WinAnsi (octal)."""
    out: list[str] = []
    for char in text:
        if char in "()\\":
            out.append("\\" + char)
        elif 32 <= ord(char) <= 126:
            out.append(char)
        else:
            try:
                raw = char.encode("cp1252")
            except UnicodeEncodeError:
                out.append("?")
                continue
            out.append("".join(f"\\{byte:03o}" for byte in raw))
    return "".join(out)


def _estimate_width(text: str, size: float) -> float:
    """Largura aproximada para alinhar números à direita (só dígitos e poucos sinais)."""
    narrow = sum(1 for c in text if c in "il.,:;' ")
    wide = sum(1 for c in text if c in "MW")
    return size * (0.28 * narrow + 0.9 * wide + 0.556 * (len(text) - narrow - wide))


class _Doc:
    def __init__(self) -> None:
        self.pages: list[list[str]] = [[]]

    def new_page(self) -> None:
        self.pages.append([])

    def text(self, x: float, y: float, value: str, size: float = 10, bold: bool = False) -> None:
        font = "F2" if bold else "F1"
        self.pages[-1].append(
            f"BT /{font} {size} Tf 1 0 0 1 {x:.2f} {y:.2f} Tm ({_escape(value)}) Tj ET"
        )

    def text_right(self, x_right: float, y: float, value: str, size: float = 10, bold: bool = False) -> None:
        self.text(x_right - _estimate_width(value, size), y, value, size, bold)

    def line(self, x1: float, y: float, x2: float, width: float = 0.5) -> None:
        self.pages[-1].append(f"{width} w {x1:.2f} {y:.2f} m {x2:.2f} {y:.2f} l S")

    def render(self) -> bytes:
        chunks: list[bytes] = [b"%PDF-1.4\n"]
        offsets: dict[int, int] = {}
        position = len(chunks[0])

        def add(obj_id: int, body: bytes) -> None:
            nonlocal position
            offsets[obj_id] = position
            data = f"{obj_id} 0 obj\n".encode() + body + b"\nendobj\n"
            chunks.append(data)
            position += len(data)

        page_ids = [5 + 2 * i for i in range(len(self.pages))]
        contents = [("\n".join(lines) + "\n").encode("latin-1") for lines in self.pages]

        add(1, b"<< /Type /Catalog /Pages 2 0 R >>")
        kids = " ".join(f"{pid} 0 R" for pid in page_ids)
        add(2, f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode())
        add(3, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
        add(4, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")

        for index, page_id in enumerate(page_ids):
            content_id = page_id + 1
            add(
                page_id,
                (
                    f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
                    f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
                    f"/Contents {content_id} 0 R >>"
                ).encode(),
            )
            data = contents[index]
            add(content_id, f"<< /Length {len(data)} >>\nstream\n".encode() + data + b"endstream")

        size = max(offsets) + 1
        xref_offset = position
        xref = [f"xref\n0 {size}\n".encode(), b"0000000000 65535 f \n"]
        for obj_id in range(1, size):
            xref.append(f"{offsets.get(obj_id, 0):010d} 00000 n \n".encode())
        trailer = f"trailer\n<< /Size {size} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode()

        return b"".join(chunks + xref + [trailer])


def _header(doc: _Doc, y: float) -> float:
    doc.text(COL_DATE, y, "Data", size=9, bold=True)
    doc.text(COL_WEEKDAY, y, "Dia", size=9, bold=True)
    doc.text(COL_PROJECT, y, "Projeto", size=9, bold=True)
    doc.text_right(COL_HOURS, y, "Horas", size=9, bold=True)
    doc.line(MARGIN, y - 5, COL_HOURS)
    return y - LINE_H


def build_monthly_report_pdf(report: MonthlyReport, user_name: str) -> bytes:
    doc = _Doc()
    year, month = report.month.split("-")

    y = PAGE_H - MARGIN
    doc.text(MARGIN, y, f"Relatório Mensal — {MONTHS[int(month) - 1]} {year}", size=16, bold=True)
    y -= 20
    doc.text(MARGIN, y, f"{user_name} · gerado em {datetime.now(TZ):%d/%m/%Y %H:%M}", size=9)
    y -= 24
    y = _header(doc, y)

    for day in report.days:
        weekday = WEEKDAYS[datetime.strptime(day.date, "%Y-%m-%d").weekday()]
        date_label = f"{day.date[8:10]}/{day.date[5:7]}"
        for project in day.projects:
            if y < BOTTOM:
                doc.new_page()
                y = _header(doc, PAGE_H - MARGIN)
            name = project.project_name if len(project.project_name) <= 45 else project.project_name[:44] + "..."
            doc.text(COL_DATE, y, date_label, size=9)
            doc.text(COL_WEEKDAY, y, weekday, size=9)
            doc.text(COL_PROJECT, y, name, size=9)
            doc.text_right(COL_HOURS, y, f"{project.total_hours:.1f}", size=9)
            y -= LINE_H
        if y < BOTTOM:
            doc.new_page()
            y = _header(doc, PAGE_H - MARGIN)
        doc.line(MARGIN, y + 10, COL_HOURS, width=0.2)
        doc.text(COL_PROJECT, y, "Total do dia", size=9, bold=True)
        doc.text_right(COL_HOURS, y, f"{day.total_hours:.1f}", size=9, bold=True)
        y -= LINE_H + 4

    if y < BOTTOM:
        doc.new_page()
        y = PAGE_H - MARGIN
    doc.line(MARGIN, y + 10, COL_HOURS, width=1)
    doc.text(COL_PROJECT, y, "Total do mês", size=11, bold=True)
    doc.text_right(COL_HOURS, y, f"{report.total_hours:.1f}", size=11, bold=True)

    total_pages = len(doc.pages)
    for index, page in enumerate(doc.pages, start=1):
        doc.pages[index - 1].append(
            f"BT /F1 8 Tf 1 0 0 1 {MARGIN} 35 Tm (Página {index} de {total_pages}) Tj ET"
        )

    return doc.render()
