import nodemailer from "nodemailer";

export default async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  let body = "";
  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const data = JSON.parse(body);

      // Build name dynamically (homepage or contact page)
      const fullName =
        data.name ||
        `${data.firstName || ""} ${data.lastName || ""}`.trim();

      // Build phone dynamically
      const phone = data.phone || "Not provided";

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "trivedibhavya1997@gmail.com",
          pass: "zqickmgtugxhrzxo" // REMOVE THE SPACE AT THE END!
        },
      });

      await transporter.sendMail({
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
      });

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));

    } catch (e) {
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  });
};
