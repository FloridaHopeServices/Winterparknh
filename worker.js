// ============================================================
//  Winter Park Care & Rehabilitation Center
//  Cloudflare Worker — Careers Form Handler
//  Handles: form submission, email to applicant + HR via Resend
// ============================================================

const RESEND_API_KEY     =  're_epMX1nfW_MD5p7ari3ytLzfJ6Pd5sKpyP'
const HR_EMAIL           = 'HR@winterparkcrh.com';
const FROM_EMAIL         = 'HR@winterparkcrh.com';
const FROM_NAME          = 'Winter Park Care & Rehabilitation Center';
const COGNITO_FORM_LINK  = 'https://www.cognitoforms.com/WinterPark1/WinterParkCareEmploymentApplication';

// ── Main Handler ─────────────────────────────────────────────
export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse();
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse form data
      const formData  = await request.formData();
      const firstName = formData.get('firstName')   || '';
      const lastName  = formData.get('lastName')    || '';
      const email     = formData.get('email')       || '';
      const phone     = formData.get('phone')       || '';
      const position  = formData.get('position')    || '';
      const fullName  = `${firstName} ${lastName}`.trim();
      const submitted = new Date().toLocaleString('en-US', {
        timeZone:     'America/New_York',
        dateStyle:    'full',
        timeStyle:    'short'
      });

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !position) {
        return jsonResponse({ 
          success: false, 
          message: 'Please fill out all required fields.' 
        }, 400);
      }

      // Send both emails simultaneously
      const [hrResult, applicantResult] = await Promise.all([
        sendHREmail(fullName, email, phone, position, submitted),
        sendApplicantEmail(fullName, email, position)
      ]);

      if (!hrResult.ok || !applicantResult.ok) {
        console.error('Email send failed', { hrResult, applicantResult });
        return jsonResponse({ 
          success: false, 
          message: 'There was an issue sending your application. Please call us at (407) 671-8030.' 
        }, 500);
      }

      return jsonResponse({ 
        success: true, 
        message: 'success' 
      });

    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
      }, 500);
    }
  }
};

// ── Email to HR ───────────────────────────────────────────────
async function sendHREmail(fullName, email, phone, position, submitted) {
  return await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify({
      from:    `${FROM_NAME} <${FROM_EMAIL}>`,
      to:      [HR_EMAIL],
      subject: `New Application Received — ${position} — ${fullName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          
          <div style="background:#7A9E87;padding:24px;border-radius:4px 4px 0 0;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;">
              New Job Application Received
            </h1>
          </div>

          <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;">
            <p style="color:#444;font-size:15px;">
              A new applicant has submitted interest through the 
              Winter Park Care & Rehabilitation Center careers form.
            </p>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr style="background:#ffffff;border-bottom:1px solid #eee;">
                <td style="padding:10px 12px;color:#888;font-size:13px;width:140px;">Full Name</td>
                <td style="padding:10px 12px;color:#222;font-size:14px;font-weight:bold;">${fullName}</td>
              </tr>
              <tr style="background:#f5f5f5;border-bottom:1px solid #eee;">
                <td style="padding:10px 12px;color:#888;font-size:13px;">Email</td>
                <td style="padding:10px 12px;color:#222;font-size:14px;">
                  <a href="mailto:${email}" style="color:#7A9E87;">${email}</a>
                </td>
              </tr>
              <tr style="background:#ffffff;border-bottom:1px solid #eee;">
                <td style="padding:10px 12px;color:#888;font-size:13px;">Phone</td>
                <td style="padding:10px 12px;color:#222;font-size:14px;">
                  <a href="tel:${phone}" style="color:#7A9E87;">${phone}</a>
                </td>
              </tr>
              <tr style="background:#f5f5f5;border-bottom:1px solid #eee;">
                <td style="padding:10px 12px;color:#888;font-size:13px;">Position</td>
                <td style="padding:10px 12px;color:#222;font-size:14px;">${position}</td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:10px 12px;color:#888;font-size:13px;">Submitted</td>
                <td style="padding:10px 12px;color:#222;font-size:14px;">${submitted}</td>
              </tr>
            </table>

            <div style="background:#fff8ee;border-left:4px solid #B8976A;padding:16px;margin:20px 0;border-radius:2px;">
              <p style="margin:0;color:#555;font-size:14px;">
                <strong>Next Step:</strong> An email with the full application link has been 
                automatically sent to the applicant. Once they complete the full application 
                you will receive another email from Cognito Forms with all details, 
                resume, photo ID, and signed certification attached.
              </p>
            </div>

            <p style="color:#888;font-size:13px;">
              If you need to resend the application link to this applicant, 
              you can forward them this link:<br>
              <a href="${COGNITO_FORM_LINK}" style="color:#7A9E87;word-break:break-all;">
                ${COGNITO_FORM_LINK}
              </a>
            </p>
          </div>

          <div style="background:#2C2C2C;padding:16px;border-radius:0 0 4px 4px;text-align:center;">
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">
              Winter Park Care & Rehabilitation Center<br>
              42970 Scarlet Road, Winter Park, FL 32792<br>
              (407) 671-8030
            </p>
          </div>

        </div>
      `
    })
  });
}

// ── Email to Applicant ────────────────────────────────────────
async function sendApplicantEmail(fullName, email, position) {
  return await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify({
      from:    `${FROM_NAME} <${FROM_EMAIL}>`,
      to:      [email],
      subject: `Complete Your Application — Winter Park Care & Rehabilitation Center`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">

          <div style="background:#7A9E87;padding:24px;border-radius:4px 4px 0 0;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;">
              Thank You for Your Interest!
            </h1>
          </div>

          <div style="background:#f9f9f9;padding:32px;border:1px solid #e0e0e0;">
            <p style="color:#444;font-size:15px;">Dear ${fullName},</p>

            <p style="color:#444;font-size:15px;">
              Thank you for expressing interest in the 
              <strong>${position}</strong> position at 
              Winter Park Care & Rehabilitation Center.
            </p>

            <p style="color:#444;font-size:15px;">
              To complete your application please click the button below. 
              You will be asked to fill out your full employment application 
              including work history, education, references, and upload your 
              resume, photo ID, and e-signature.
            </p>

            <div style="text-align:center;margin:32px 0;">
              <a href="${COGNITO_FORM_LINK}" 
                 style="background:#7A9E87;color:#ffffff;padding:16px 40px;
                        border-radius:4px;text-decoration:none;font-size:15px;
                        font-weight:bold;letter-spacing:0.5px;display:inline-block;">
                Complete Your Application →
              </a>
            </div>

            <p style="color:#888;font-size:13px;text-align:center;">
              Or copy and paste this link into your browser:<br>
              <a href="${COGNITO_FORM_LINK}" style="color:#7A9E87;word-break:break-all;font-size:12px;">
                ${COGNITO_FORM_LINK}
              </a>
            </p>

            <div style="background:#fff8ee;border-left:4px solid #B8976A;padding:16px;margin:24px 0;border-radius:2px;">
              <p style="margin:0;color:#555;font-size:13px;">
                <strong>Please note:</strong> Your application will not be reviewed until 
                the full application form is completed and submitted.
              </p>
            </div>

            <p style="color:#444;font-size:14px;">
              If you have any questions please don't hesitate to contact us:
            </p>

            <table style="width:100%;margin:8px 0;">
              <tr>
                <td style="color:#888;font-size:13px;padding:4px 0;">Phone</td>
                <td style="color:#222;font-size:13px;padding:4px 0;">
                  <a href="tel:4076718030" style="color:#7A9E87;">(407) 671-8030</a>
                </td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;padding:4px 0;">Email</td>
                <td style="color:#222;font-size:13px;padding:4px 0;">
                  <a href="mailto:HR@winterparkcrh.com" style="color:#7A9E87;">
                    HR@winterparkcrh.com
                  </a>
                </td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;padding:4px 0;">Address</td>
                <td style="color:#222;font-size:13px;padding:4px 0;">
                  42970 Scarlet Road, Winter Park, FL 32792
                </td>
              </tr>
            </table>

            <p style="color:#444;font-size:14px;margin-top:24px;">
              We look forward to reviewing your application!
            </p>

            <p style="color:#444;font-size:14px;">
              Warm regards,<br>
              <strong>HR Department</strong><br>
              Winter Park Care & Rehabilitation Center
            </p>
          </div>

          <div style="background:#2C2C2C;padding:16px;border-radius:0 0 4px 4px;text-align:center;">
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">
              Winter Park Care & Rehabilitation Center<br>
              42970 Scarlet Road, Winter Park, FL 32792<br>
              (407) 671-8030 | HR@winterparkcrh.com
            </p>
          </div>

        </div>
      `
    })
  });
}

// ── Helpers ───────────────────────────────────────────────────
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function corsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
