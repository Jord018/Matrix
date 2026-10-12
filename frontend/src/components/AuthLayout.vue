<script setup>
defineProps({ title: { type: String, required: true } })
</script>

<!-- Old store login/register look (login-style.css + anime.js intro, ported to CSS). -->
<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="brand-side">
        <div>
          <div class="brand-logo"><span>MOUSE JERRY</span></div>
          <div class="brand-tagline">Unlock the ultimate gaming experience.</div>
        </div>
        <div class="brand-footer">
          Experiencing issues?<br>
          Get assistance via <a href="mailto:support@mousejerry.com">support@mousejerry.com</a>
        </div>
      </div>

      <div class="form-side">
        <h2 class="auth-title">{{ title }}</h2>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: url('/image/background.png') center / cover no-repeat;
}

.auth-container {
  display: flex;
  width: 1000px;
  max-width: 100%;
  min-height: 550px;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  /* backwards, not both: a kept opacity/transform would stop the brand panel blur */
  animation: auth-pop 1s cubic-bezier(0.25, 1, 0.5, 1) backwards;
}

.form-side {
  flex: 1.2;
  padding: 4rem 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
}

.auth-title {
  color: #1a1a1a;
  font-weight: 800;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.form-side :deep(.auth-subtitle) {
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
  line-height: 1.5;
  animation-delay: 0.8s;
}

.form-side :deep(.auth-subtitle a) {
  color: var(--primary);
  font-weight: bold;
  text-decoration: none;
}

.form-side :deep(.input-group) {
  margin-bottom: 1.8rem;
  position: relative;
}

.form-side :deep(.auth-input) {
  width: 100%;
  padding: 1.4rem 1.2rem 0.8rem 1.2rem;
  background: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 8px;
  color: #333;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-side :deep(.auth-input:focus) {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(54, 1, 133, 0.1);
}

.form-side :deep(.auth-label) {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #868e96;
  font-weight: 600;
  pointer-events: none;
  transition: all 0.2s ease-out;
}

.form-side :deep(.auth-input:focus ~ .auth-label),
.form-side :deep(.auth-input:not(:placeholder-shown) ~ .auth-label) {
  top: 0;
  left: 0.8rem;
  font-size: 0.8rem;
  color: var(--primary);
  background-color: #ffffff;
  padding: 0 0.4rem;
}

.form-side :deep(.auth-btn) {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(54, 1, 133, 0.3);
  animation-delay: 0.9s;
}

.form-side :deep(.auth-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(143, 1, 119, 0.4);
  filter: brightness(1.1);
}

.form-side :deep(.error-box) {
  background: #ffeaa7;
  color: #b02a37;
  padding: 1rem;
  border-radius: 8px;
  font-weight: bold;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border-left: 4px solid #b02a37;
}

.brand-side {
  flex: 0.8;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(10, 5, 25, 0.7);
  backdrop-filter: blur(12px);
  color: white;
}

.brand-logo {
  font-family: 'Bungee', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
}

.brand-tagline {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 2rem;
  animation-delay: 0.75s;
}

.brand-footer {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  animation-delay: 0.9s;
}

.brand-footer a {
  color: white;
  text-decoration: underline;
}

/* Staggered intro, same timings as the old anime.js calls */
.auth-title,
.form-side :deep(.error-box),
.form-side :deep(.input-group),
.form-side :deep(.auth-subtitle),
.form-side :deep(.auth-btn) {
  animation: auth-rise 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.4s both;
}
.form-side :deep(.input-group:nth-of-type(2)) { animation-delay: 0.5s; }
.form-side :deep(.input-group:nth-of-type(3)) { animation-delay: 0.6s; }
.form-side :deep(.input-group:nth-of-type(4)) { animation-delay: 0.7s; }
.brand-logo, .brand-tagline, .brand-footer {
  animation: auth-slide 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.6s both;
}

@keyframes auth-pop { from { opacity: 0; transform: scale(0.95); } }
@keyframes auth-rise { from { opacity: 0; transform: translateY(15px); } }
@keyframes auth-slide { from { opacity: 0; transform: translateX(20px); } }

@media (prefers-reduced-motion: reduce) {
  .auth-container, .auth-title, .brand-logo, .brand-tagline, .brand-footer,
  .form-side :deep(*) { animation: none !important; }
}

@media (max-width: 768px) {
  .auth-container {
    min-height: auto;
    flex-direction: column;
    border: none;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }
  .brand-side { display: none; }
  .form-side { padding: 3rem 2rem; }
  .auth-title { font-size: 2.2rem; text-align: center; margin-bottom: 1rem; }
  .form-side :deep(.auth-subtitle) { text-align: center; }
  .form-side :deep(.auth-btn) { margin-top: 1rem; }
}
</style>
