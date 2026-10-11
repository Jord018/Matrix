<script setup>
import { ref, reactive } from "vue";

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const isSuccess = ref(false);

const handleSubmit = () => {
  console.log("Contact form submitted:", {
    name: form.name,
    email: form.email,
    subject: form.subject,
    message: form.message,
  });

  form.name = "";
  form.email = "";
  form.subject = "";
  form.message = "";

  isSuccess.value = true;
  setTimeout(() => {
    isSuccess.value = false;
  }, 3000);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <h1 class="text-3xl font-bold text-primary mb-6">Contact Us</h1>

    <div v-if="isSuccess" class="mb-6 p-4 bg-green-100 text-green-700 rounded-lg font-semibold">
      Message Sent!
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Contact Info & Map -->
      <div class="bg-white p-6 rounded-xl shadow-md border space-y-6">
        <div>
          <h2 class="text-xl font-bold text-primary mb-4">Get in Touch</h2>
          <div class="space-y-3 text-gray-700">
            <p class="flex items-center gap-2">
              <i class="fa-solid fa-envelope text-accent-red"></i>
              <span>support@mousejerry.com</span>
            </p>
            <p class="flex items-center gap-2">
              <i class="fa-solid fa-phone text-accent-red"></i>
              <span>+66 12 345 6789</span>
            </p>
            <p class="flex items-center gap-2">
              <i class="fa-solid fa-location-dot text-accent-red"></i>
              <span>Chiang Mai University</span>
            </p>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-primary mb-2">Our Location</h3>
          <div class="w-full h-64 rounded-lg overflow-hidden border">
            <iframe
              title="Location Map"
              class="w-full h-full border-0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3777.0123!2d98.95!3d18.79!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDQ3JzI0LjAiTiA5OMKwNTcnMDAuMCJF!5e0!3m2!1sen!2sth!4v1234567890"
              allowfullscreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="bg-white p-6 rounded-xl shadow-md border">
        <h2 class="text-xl font-bold text-primary mb-4">Send us a Message</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label for="subject" class="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
            <input
              id="subject"
              v-model="form.subject"
              type="text"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label for="message" class="block text-sm font-semibold text-gray-700 mb-1">Message</label>
            <textarea
              id="message"
              v-model="form.message"
              rows="4"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full bg-accent-red text-white font-bold py-2.5 px-4 rounded-lg hover:brightness-110 transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
