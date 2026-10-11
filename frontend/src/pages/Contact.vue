<script setup>
import { ref } from "vue";

const form = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const isSubmitted = ref(false);

const submitForm = () => {
  // จำลองการส่งข้อมูล
  console.log("Contact form submitted:", form.value);
  isSubmitted.value = true;

  // ล้างฟอร์ม
  form.value = { name: "", email: "", subject: "", message: "" };

  // ซ่อนข้อความแจ้งเตือนหลังผ่านไป 3 วินาที
  setTimeout(() => {
    isSubmitted.value = false;
  }, 3000);
};
</script>

<template>
  <div class="container mx-auto px-4 mt-12 mb-16 min-h-[60vh] max-w-6xl">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-extrabold text-primary mb-4">Contact Us</h2>
      <p class="text-gray-500 text-lg max-w-2xl mx-auto">
        Have a question about a game, your order, or just want to say hi? We're
        here to help!
      </p>
    </div>

    <div
      class="flex flex-col lg:flex-row gap-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Left Column: Contact Info -->
      <div
        class="w-full lg:w-5/12 bg-primary p-10 text-white flex flex-col justify-between relative overflow-hidden"
      >
        <!-- Background Decoration -->
        <div
          class="absolute -right-16 -top-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -left-16 -bottom-16 w-64 h-64 bg-accent-yellow opacity-10 rounded-full blur-2xl pointer-events-none"
        ></div>

        <div class="relative z-10">
          <h3 class="text-3xl font-bold mb-8 text-accent-yellow">
            Get in Touch
          </h3>

          <ul class="space-y-8 text-lg">
            <li class="flex items-start gap-4">
              <i
                class="fa-solid fa-location-dot mt-1 text-2xl text-accent-red w-8 text-center"
              ></i>
              <div>
                <strong class="block text-xl mb-1">Our Office</strong>
                <span class="text-gray-300 block leading-relaxed">
                  College of Arts, Media and Technology (CAMT)<br />
                  Chiang Mai University, Chiang Mai, Thailand
                </span>
              </div>
            </li>
            <li class="flex items-start gap-4">
              <i
                class="fa-solid fa-envelope mt-1 text-2xl text-accent-red w-8 text-center"
              ></i>
              <div>
                <strong class="block text-xl mb-1">Email Us</strong>
                <a
                  href="mailto:support@mousejerry.com"
                  class="text-gray-300 hover:text-white transition-colors"
                  >support@mousejerry.com</a
                >
              </div>
            </li>
            <li class="flex items-start gap-4">
              <i
                class="fa-solid fa-phone mt-1 text-2xl text-accent-red w-8 text-center"
              ></i>
              <div>
                <strong class="block text-xl mb-1">Call Us</strong>
                <a
                  href="tel:+66123456789"
                  class="text-gray-300 hover:text-white transition-colors"
                  >+66 12 345 6789</a
                >
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Right Column: Contact Form -->
      <div class="w-full lg:w-7/12 p-10">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>

        <div
          v-if="isSubmitted"
          class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 transition-all"
          role="alert"
        >
          <p class="font-bold">
            <i class="fa-solid fa-circle-check mr-2"></i> Message Sent!
          </p>
          <p class="text-sm">
            Thank you for contacting us. We will get back to you shortly.
          </p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label for="name" class="block text-gray-700 font-semibold mb-2"
                >Your Name</label
              >
              <input
                type="text"
                id="name"
                v-model="form.name"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label for="email" class="block text-gray-700 font-semibold mb-2"
                >Email Address</label
              >
              <input
                type="email"
                id="email"
                v-model="form.email"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label for="subject" class="block text-gray-700 font-semibold mb-2"
              >Subject</label
            >
            <input
              type="text"
              id="subject"
              v-model="form.subject"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="How can we help you?"
            />
          </div>

          <div>
            <label for="message" class="block text-gray-700 font-semibold mb-2"
              >Message</label
            >
            <textarea
              id="message"
              v-model="form.message"
              rows="4"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="Write your message here..."
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-twilight hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-paper-plane"></i> Send Message
          </button>
        </form>
      </div>
    </div>

    <!-- Map Section -->
    <div
      class="mt-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[400px]"
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3777.100618057997!2d98.9507963153574!3d18.795123587249457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a6988894cb1%3A0x10f7601b0f55cf08!2sCollege%20of%20Arts%2C%20Media%20and%20Technology%20(CAMT)!5e0!3m2!1sen!2sth!4v1680000000000!5m2!1sen!2sth"
        width="100%"
        height="100%"
        style="border: 0"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="College of Arts, Media and Technology Location Map"
      >
      </iframe>
    </div>
  </div>
</template>
