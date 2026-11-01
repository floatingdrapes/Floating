import nodemailer from "nodemailer";

export async function handleSendEmail(req: any, res: any) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { formType, formData, result } = body;
    
    if (!formData) {
      return res.status(400).json({ error: "Missing formData" });
    }

    const recipient = process.env.SMTP_TO || process.env.NOTIFICATION_EMAIL || "floatingdrips@gmail.com";

    const subject = `[Floating Drapes] New ${formType || 'Form'} Submission from ${formData.name || 'Anonymous'}`;

    let emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #c8a56a; background-color: #021e3b; color: #ffffff; border-radius: 4px;">
        <div style="text-align: center; border-bottom: 1px solid rgba(200,165,106,0.3); padding-bottom: 20px; margin-bottom: 24px;">
          <span style="font-size: 10px; font-weight: bold; letter-spacing: 0.3em; color: #c8a56a; text-transform: uppercase; display: block; margin-bottom: 6px;">✦ FLOATING DRAPES ✦</span>
          <h2 style="font-size: 22px; font-weight: normal; font-family: Georgia, serif; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
            New Lead Registration
          </h2>
        </div>
        
        <p style="font-size: 14px; color: #dfdfdf; line-height: 1.6; margin-bottom: 24px;">
          A user has successfully completed the <strong>${formType || 'Estimate Form'}</strong>. The custom details submitted are logged below:
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tbody>
    `;

    for (const [key, val] of Object.entries(formData)) {
      if (val !== undefined && val !== null && val !== "") {
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        emailHtml += `
          <tr style="border-bottom: 1px solid rgba(200, 165, 106, 0.15);">
            <td style="padding: 12px 6px; font-weight: bold; color: #c8a56a; font-size: 12px; width: 35%; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">
              ${formattedKey}
            </td>
            <td style="padding: 12px 6px; color: #ffffff; font-size: 14px; line-height: 1.5; vertical-align: top;">
              ${val}
            </td>
          </tr>
        `;
      }
    }

    if (result) {
      emailHtml += `
        <tr style="border-bottom: 1px solid rgba(200, 165, 106, 0.15);">
          <td style="padding: 12px 6px; font-weight: bold; color: #c8a56a; font-size: 12px; width: 35%; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">
            Registration Result
          </td>
          <td style="padding: 12px 6px; color: #ffffff; font-size: 13px; font-style: italic; line-height: 1.5; vertical-align: top;">
            ${result}
          </td>
        </tr>
      `;
    }

    emailHtml += `
          </tbody>
        </table>
        
        <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(200,165,106,0.1); padding: 16px; text-align: center; margin-top: 32px;">
          <p style="font-size: 12px; color: #c8a56a; margin: 0 0 4px 0; font-weight: bold; tracking-wider; text-transform: uppercase;">
            Action Required
          </p>
          <p style="font-size: 12px; color: #dfdfdf; margin: 0; line-height: 1.5;">
            Please contact the client within 2 hours to coordinate swatches.
          </p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(200, 165, 106, 0.15); font-size: 10px; color: #a0aec0; text-align: center; letter-spacing: 0.05em;">
          AUTOMATED CONCIERGE NOTIFICATION • FLOATING DRAPES DIGITAL STUDIO
        </div>
      </div>
    `;

    let emailText = `FLOATING DRAPES - NEW LEAD SUBMISSION\n\n`;
    emailText += `Form Category: ${formType || 'Estimate Form'}\n`;
    emailText += `------------------------------------------\n`;
    for (const [key, val] of Object.entries(formData)) {
      if (val) {
        const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
        emailText += `${formattedKey}: ${val}\n`;
      }
    }
    if (result) {
      emailText += `Status/Result: ${result}\n`;
    }

    let transporter;
    let isTestAccount = false;
    let previewUrl = "";

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      isTestAccount = true;
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Floating Drapes Web" <noreply@floatingdrapes.com>`,
      to: recipient,
      subject: subject,
      text: emailText,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    if (isTestAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info) || "";
    }

    return res.status(200).json({
      success: true,
      message: "Notification dispatched successfully",
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    });
  } catch (error: any) {
    console.error("Email dispatch error:", error);
    return res.status(500).json({ error: error.message || "Failed to dispatch email" });
  }
}

export default function handler(req: any, res: any) {
  return handleSendEmail(req, res);
}
