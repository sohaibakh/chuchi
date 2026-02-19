import ButtonUnderlined from '@/components/ButtonUnderlined'
export default {
    name: "ContactForm",
    components: {
      ButtonUnderlined
    },
    data() {
      return {
        formData: {
          name: "",
          email: "",
          message: "",
        },
        submissionSuccess: false,
        errorMessage: "",
      };
    },
    methods: {
      async handleSubmit() {
        console.log("🚀 [Contact Form] Form submission started");
        console.log("📝 [Contact Form] Form data:", this.formData);
        
        this.errorMessage = "";
        this.submissionSuccess = false;
      
        try {
          console.log("📡 [Contact Form] Sending POST request to /api/contact...");
          
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.formData),
          });
      
          console.log("📨 [Contact Form] Response received. Status:", res.status, res.statusText);
          
          const data = await res.json();
          console.log("📦 [Contact Form] Response data:", data);
      
          if (data.success) {
            console.log("✅ [Contact Form] Email sent successfully!");
            this.submissionSuccess = true;
      
            this.formData = {
              name: "",
              email: "",
              message: ""
            };
          } else {
            console.error("❌ [Contact Form] Email failed:", data.error);
            this.errorMessage = "Email failed: " + data.error;
          }
        } catch (err) {
          console.error("🔥 [Contact Form] Network error:", err);
          this.errorMessage = "Network error. Try again.";
        }
      }
      
      ,
    },
  };
  