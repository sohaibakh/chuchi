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
        this.errorMessage = "";
        this.submissionSuccess = false;
      
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.formData),
          });
      
          const data = await res.json();
      
          if (data.success) {
            this.submissionSuccess = true;
      
            this.formData = {
              name: "",
              email: "",
              message: ""
            };
          } else {
            this.errorMessage = "Email failed: " + data.error;
          }
        } catch (err) {
          this.errorMessage = "Network error. Try again.";
        }
      }
      
      ,
    },
  };
  