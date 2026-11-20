from datetime import date, timedelta

from app.schemas.report import DailySummaryItem, MonthlyReport, MonthlyReportItem
from app.services.report_pdf import build_monthly_report_pdf


def _create_entries(client, headers, count=2):
    project_id = client.post(
        "/api/projects/", json={"name": "P", "color": "#22c55e"}, headers=headers
    ).json()["id"]
    for i in range(count):
        client.post("/api/entries/", json={
            "project_id": project_id,
            "hours": 2.0,
            "date": f"2026-06-0{i + 1}T12:00:00",
        }, headers=headers)
    return project_id


def test_monthly_pdf_returns_pdf(client, auth_headers):
    _create_entries(client, auth_headers)

    response = client.get("/api/reports/monthly/pdf", params={"month": "2026-06"}, headers=auth_headers)

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
    assert response.content.rstrip().endswith(b"%%EOF")
    assert 'filename="relatorio-2026-06.pdf"' in response.headers["content-disposition"]


def test_monthly_pdf_rejects_invalid_month(client, auth_headers):
    response = client.get("/api/reports/monthly/pdf", params={"month": "junho"}, headers=auth_headers)
    assert response.status_code == 422


def test_monthly_pdf_requires_auth(client):
    response = client.get("/api/reports/monthly/pdf", params={"month": "2026-06"})
    assert response.status_code in (401, 403)


def test_monthly_pdf_of_empty_month_is_valid(client, auth_headers):
    response = client.get("/api/reports/monthly/pdf", params={"month": "2026-01"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.content.startswith(b"%PDF")


def test_pdf_breaks_pages_when_rows_do_not_fit():
    days = []
    start = date(2026, 1, 1)
    for i in range(120):
        days.append(MonthlyReportItem(
            date=(start + timedelta(days=i)).isoformat(),
            total_hours=6.0,
            projects=[DailySummaryItem(
                project_id="a", project_name="Projeto A", project_color="#fff",
                total_hours=6.0, entries_count=1,
            )],
        ))
    report = MonthlyReport(month="2026-01", total_hours=720.0, days=days)

    pdf = build_monthly_report_pdf(report, "Teste")

    assert pdf.startswith(b"%PDF")
    pages = int(pdf.split(b"/Count ")[1].split()[0])
    assert pages > 1  # 120 linhas não cabem em uma página
