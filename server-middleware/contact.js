import nodemailer from "nodemailer";

export default async (req, res) => {
  console.log("📥 [API /api/contact] Request received. Method:", req.method);
  
  if (req.method !== "POST") {
    console.warn("⚠️ [API /api/contact] Method not allowed:", req.method);
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  let body = "";
  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    console.log("📨 [API /api/contact] Request body received:", body);
    
    try {
      const data = JSON.parse(body);
      console.log("📝 [API /api/contact] Parsed data:", data);

      // Build name dynamically (homepage or contact page)
      const fullName =
        data.name ||
        `${data.firstName || ""} ${data.lastName || ""}`.trim();

      // Build phone dynamically
      const phone = data.phone || "Not provided";

      console.log("📧 [API /api/contact] Creating email transporter...");
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "trivedibhavya1997@gmail.com",
          pass: "zqickmgtugxhrzxo"
        },
      });
      
      console.log("✉️ [API /api/contact] Sending email...");

      const mailOptions = {
        from: `"Website Contact Form" <trivedibhavya1997@gmail.com>`,
        to: "trivedibhavya1997@gmail.com",
        subject: "New Contact Form Submission",
        html: `
          <h2>New Message</h2>

          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${data.email || "Not provided"}</p>
          <p><strong>Phone:</strong> ${phone}</p>

          <p><strong>Message:</strong></p>
          <p>${data.message || "No message provided"}</p>

          <br><hr>
          <p style="font-size:12px;opacity:0.6;">
             This email was generated automatically from your website contact form.
          </p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      
      console.log("✅ [API /api/contact] Email sent successfully!");

      console.log("📤 [API /api/contact] Sending success response");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));

    } catch (e) {
      console.error("🔥 [API /api/contact] Error occurred:", e.message);
      console.error("📋 [API /api/contact] Full error:", e);
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  });
};
