"""
Astroman Skywatcher — Email Service
Supports SMTP and SendGrid.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.config import settings
from app.models import ObservationData
from app.core.telescope import TelescopeRecommendation

logger = logging.getLogger("astroman.email")


def _build_html_email(
    observation: ObservationData,
    telescope: TelescopeRecommendation,
) -> str:
    """Build premium HTML email template."""
    # Determine observation quality indicator
    if observation.cloud_coverage <= 20:
        quality_badge = "🟢 შესანიშნავი"
        quality_color = "#22c55e"
    elif observation.cloud_coverage <= 50:
        quality_badge = "🟡 კარგი"
        quality_color = "#eab308"
    else:
        quality_badge = "🔴 შეზღუდული"
        quality_color = "#ef4444"

    visible_planets = [p for p in observation.planets if p.is_visible]
    planets_html = ""
    for p in visible_planets:
        planets_html += f"""
        <tr>
            <td style="padding:10px 16px;border-bottom:1px solid #1e293b;color:#e2e8f0;font-weight:600;">{p.name_ka}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #1e293b;color:#94a3b8;">{p.altitude:.0f}°</td>
            <td style="padding:10px 16px;border-bottom:1px solid #1e293b;color:#94a3b8;">{p.magnitude:.1f}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #1e293b;color:#94a3b8;">{p.constellation}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="ka">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#030712;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:640px;margin:0 auto;background-color:#0f172a;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);padding:48px 32px;text-align:center;border-bottom:1px solid #312e81;">
        <div style="font-size:14px;letter-spacing:6px;color:#818cf8;text-transform:uppercase;margin-bottom:12px;">ASTROMAN</div>
        <h1 style="color:#f8fafc;font-size:28px;margin:0 0 8px;font-weight:400;">ღამის ცის გზამკვლევი</h1>
        <div style="color:#64748b;font-size:14px;">{observation.date} · {settings.location_name}</div>
    </div>

    <!-- Quality Badge -->
    <div style="padding:24px 32px;text-align:center;">
        <span style="display:inline-block;background:{quality_color}22;color:{quality_color};padding:8px 24px;border-radius:24px;font-size:14px;border:1px solid {quality_color}44;">
            დაკვირვების პირობები: {quality_badge}
        </span>
    </div>

    <!-- Key Stats -->
    <div style="padding:0 32px 24px;">
        <table style="width:100%;border-collapse:collapse;">
            <tr>
                <td style="text-align:center;padding:16px;background:#1e293b;border-radius:12px 0 0 12px;">
                    <div style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:2px;">მზის ჩასვლა</div>
                    <div style="color:#f8fafc;font-size:22px;margin-top:6px;">{observation.sunset_time}</div>
                </td>
                <td style="text-align:center;padding:16px;background:#1e293b;border-left:1px solid #334155;">
                    <div style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:2px;">მთვარე</div>
                    <div style="color:#f8fafc;font-size:22px;margin-top:6px;">{observation.moon_illumination:.0f}%</div>
                </td>
                <td style="text-align:center;padding:16px;background:#1e293b;border-left:1px solid #334155;border-radius:0 12px 12px 0;">
                    <div style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:2px;">ღრუბლები</div>
                    <div style="color:#f8fafc;font-size:22px;margin-top:6px;">{observation.cloud_coverage}%</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Best Object -->
    {"" if not observation.best_object else f'''
    <div style="padding:0 32px 32px;">
        <div style="background:linear-gradient(135deg,#312e81,#1e1b4b);border:1px solid #4338ca;border-radius:16px;padding:32px;text-align:center;">
            <div style="color:#a5b4fc;font-size:12px;text-transform:uppercase;letter-spacing:4px;margin-bottom:8px;">დღეს საღამოს ეძებე</div>
            <div style="color:#f8fafc;font-size:32px;font-weight:700;margin-bottom:8px;">{observation.best_object}</div>
        </div>
    </div>
    '''}

    <!-- Visible Planets Table -->
    {"" if not visible_planets else f'''
    <div style="padding:0 32px 32px;">
        <h2 style="color:#e2e8f0;font-size:18px;font-weight:400;margin-bottom:16px;">🪐 ხილული პლანეტები</h2>
        <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:12px;overflow:hidden;">
            <thead>
                <tr style="background:#334155;">
                    <th style="padding:10px 16px;text-align:left;color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">პლანეტა</th>
                    <th style="padding:10px 16px;text-align:left;color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">სიმაღლე</th>
                    <th style="padding:10px 16px;text-align:left;color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">mag</th>
                    <th style="padding:10px 16px;text-align:left;color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">თანავარსკვლავედი</th>
                </tr>
            </thead>
            <tbody>{planets_html}</tbody>
        </table>
    </div>
    '''}

    <!-- Moon Phase -->
    <div style="padding:0 32px 32px;">
        <div style="background:#1e293b;border-radius:12px;padding:24px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🌙</div>
            <div style="color:#e2e8f0;font-size:18px;">{observation.moon_phase}</div>
            <div style="color:#64748b;font-size:14px;margin-top:4px;">განათებულობა: {observation.moon_illumination:.0f}%</div>
        </div>
    </div>

    <!-- Telescope Recommendation -->
    <div style="padding:0 32px 32px;">
        <div style="background:linear-gradient(135deg,#1e3a5f,#1e293b);border:1px solid #2563eb;border-radius:16px;padding:32px;text-align:center;">
            <div style="color:#60a5fa;font-size:12px;text-transform:uppercase;letter-spacing:4px;margin-bottom:12px;">რეკომენდებული ტელესკოპი</div>
            <div style="color:#f8fafc;font-size:22px;font-weight:600;margin-bottom:12px;">🔭 {telescope.name}</div>
            <div style="color:#94a3b8;font-size:14px;margin-bottom:24px;line-height:1.6;">{telescope.reason_ka}</div>
            <a href="{telescope.product_url}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 48px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:1px;">
                იხილე ტელესკოპი →
            </a>
        </div>
    </div>

    <!-- Observation Guide -->
    <div style="padding:0 32px 32px;">
        <h2 style="color:#e2e8f0;font-size:18px;font-weight:400;margin-bottom:16px;">📋 დაკვირვების გზამკვლევი</h2>
        <div style="background:#1e293b;border-radius:12px;padding:24px;color:#cbd5e1;font-size:14px;line-height:1.8;white-space:pre-line;">{observation.observation_text}</div>
    </div>

    <!-- Footer -->
    <div style="padding:32px;text-align:center;border-top:1px solid #1e293b;">
        <div style="color:#64748b;font-size:12px;margin-bottom:8px;">
            <a href="{settings.astroman_store_url}" style="color:#818cf8;text-decoration:none;">astroman.ge</a>
        </div>
        <div style="color:#475569;font-size:11px;">
            © Astroman Skywatcher · {settings.location_name}
        </div>
    </div>
</div>
</body>
</html>"""
    return html


def build_email_subject(observation: ObservationData) -> str:
    """Build dynamic email subject line."""
    if observation.best_object:
        return f"🔭 დღეს საღამოს ცაში ჩანს {observation.best_object} — მზად ხარ?"
    if observation.cloud_coverage > 75:
        return "☁️ ღრუბლიანი ღამეა — კოსმოსი სახლში შემოიტანე"
    return f"🌙 ღამის ცის გზამკვლევი — {observation.date}"


async def send_email_smtp(
    to_email: str,
    subject: str,
    html_body: str,
) -> bool:
    """Send email via SMTP."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"] = to_email

        html_part = MIMEText(html_body, "html", "utf-8")
        msg.attach(html_part)

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.sendmail(settings.smtp_from_email, to_email, msg.as_string())

        logger.info(f"Email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"SMTP send error to {to_email}: {e}")
        return False


async def send_email_sendgrid(
    to_email: str,
    subject: str,
    html_body: str,
) -> bool:
    """Send email via SendGrid."""
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        message = Mail(
            from_email=settings.sendgrid_from_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_body,
        )
        sg = SendGridAPIClient(settings.sendgrid_api_key)
        response = sg.send(message)
        logger.info(f"SendGrid email sent to {to_email}: {response.status_code}")
        return response.status_code in (200, 201, 202)

    except Exception as e:
        logger.error(f"SendGrid send error to {to_email}: {e}")
        return False


async def send_observation_email(
    to_email: str,
    observation: ObservationData,
    telescope: TelescopeRecommendation,
) -> bool:
    """Send a daily observation email."""
    subject = build_email_subject(observation)
    html = _build_html_email(observation, telescope)

    if settings.email_provider == "sendgrid":
        return await send_email_sendgrid(to_email, subject, html)
    else:
        return await send_email_smtp(to_email, subject, html)
