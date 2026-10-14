<template>
  <div class="store-container my-6 lg:my-12">
    <div class="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(54,1,133,0.08)] p-6 lg:p-12 border-t-[6px] border-primary font-['Expletus_Sans',sans-serif]">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <!-- Left Column: Contact Links & Address -->
        <div class="lg:col-span-5 order-2 lg:order-1 flex flex-col">
          <h1 class="font-extrabold text-primary text-[2rem] lg:text-[2.5rem] mb-6 mt-4 lg:mt-0">Contact us</h1>

          <div class="flex flex-col mb-10 pl-2 lg:pl-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-[1.25rem] text-[#334155] no-underline font-semibold mb-5 transition-all duration-300 hover:text-secondary hover:translate-x-1 group"
            >
              <i class="fa-brands fa-instagram text-[1.8rem] w-[45px] text-primary transition-all duration-300 group-hover:text-accent-red group-hover:scale-115"></i>
              <span>Instagram</span>
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-[1.25rem] text-[#334155] no-underline font-semibold mb-5 transition-all duration-300 hover:text-secondary hover:translate-x-1 group"
            >
              <i class="fa-brands fa-facebook-f text-[1.8rem] w-[45px] text-primary transition-all duration-300 group-hover:text-accent-red group-hover:scale-115"></i>
              <span>Facebook</span>
            </a>

            <a
              href="tel:+66123456789"
              class="inline-flex items-center text-[1.25rem] text-[#334155] no-underline font-semibold mb-5 transition-all duration-300 hover:text-secondary hover:translate-x-1 group"
            >
              <i class="fa-solid fa-phone text-[1.8rem] w-[45px] text-primary transition-all duration-300 group-hover:text-accent-red group-hover:scale-115"></i>
              <span>+66 123 456 789</span>
            </a>
          </div>

          <h1 class="font-extrabold text-primary text-[2rem] lg:text-[2.5rem] mb-6 mt-4 lg:mt-0">Address</h1>

          <div class="bg-[#f8fafc] p-6 rounded-xl border-l-4 border-accent-yellow text-[#475569] text-[1.1rem] leading-[1.6] lg:ml-4">
            <strong class="text-slate-800">Mouse Jerry Keys HQ</strong><br />
            Floor 99, Cyber Gaming Tower<br />
            Nimmanhaemin Road<br />
            Chiang Mai, Thailand 50200
          </div>
        </div>

        <!-- Right Column: Map -->
        <div class="lg:col-span-7 order-1 lg:order-2 flex flex-col h-full">
          <h1 class="font-extrabold text-primary text-[2.5rem] mb-6 hidden lg:block">Map</h1>

          <div class="w-full h-[450px] min-h-[300px] mb-8 lg:mb-0 rounded-2xl overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.08)] border-2 border-[#e2e8f0] block grow">
            <iframe
              title="Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.996644516145!2d98.94861287475733!3d18.79830288234989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3b902f64ad41%3A0xf1d0456e4321eebb!2sMale%20Dormitory%201!5e0!3m2!1sen!2sth!4v1773845409590!5m2!1sen!2sth"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              class="w-full h-full block border-0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
