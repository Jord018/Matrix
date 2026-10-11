<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['page-changed']);

// คำนวณอาร์เรย์ของหน้าที่จะแสดงผล (รวมถึงการใส่ '...')
const pages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const items = [];

  if (total <= 1) return items;

  for (let i = 1; i <= total; i++) {
    // แสดงหน้า 1, หน้าสุดท้าย, และหน้าก่อน/หลัง หน้าปัจจุบัน 1 หน้า
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      items.push(i);
    }
    // เพิ่มจุดไข่ปลา (...) สำหรับหน้าที่ถูกข้าม
    else if (i === current - 2 || i === current + 2) {
      items.push('...');
    }
  }
  return items;
});

const changePage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-changed', page);
  }
};
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="Game page navigation">
    <ul class="flex justify-center items-center gap-1 my-8 list-none p-0">
      <!-- ปุ่ม Prev -->
      <li>
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      </li>

      <!-- ตัวเลขหน้า -->
      <li v-for="(item, index) in pages" :key="index">
        <span v-if="item === '...'" class="flex items-center justify-center w-10 h-10 text-gray-400 font-bold bg-transparent border-0">
          ...
        </span>
        <button
          v-else
          @click="changePage(item)"
          class="flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors"
          :class="item === currentPage ? 'bg-primary text-white shadow-md' : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-100'"
        >
          {{ item }}
        </button>
      </li>

      <!-- ปุ่ม Next -->
      <li>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </li>
    </ul>
  </nav>
</template>