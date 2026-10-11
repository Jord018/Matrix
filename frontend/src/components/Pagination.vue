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
    else if ((i === current - 2 || i === current + 2) && items.at(-1) !== '...') {
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
    <ul id="paginationControls" class="flex justify-center items-center list-none p-0 my-10 gap-1 flex-wrap">
      <!-- ปุ่ม Prev -->
      <li class="inline-flex" :class="{ 'pointer-events-none': currentPage === 1 }">
        <button
          type="button"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="border-none font-bold rounded-lg w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all text-[0.95rem] cursor-pointer"
          :class="currentPage === 1 ? 'text-gray-300 bg-transparent cursor-default' : 'text-primary hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm'"
          aria-label="Previous Page"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      </li>

      <!-- ตัวเลขหน้า -->
      <li
        v-for="(item, index) in pages"
        :key="index"
        class="inline-flex"
      >
        <span
          v-if="item === '...'"
          class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-transparent border-0 text-gray-400 font-bold"
        >
          ...
        </span>
        <button
          v-else
          type="button"
          @click="changePage(item)"
          class="border-none font-bold rounded-lg w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all text-[0.95rem] cursor-pointer"
          :class="item === currentPage 
            ? 'bg-gradient-to-r from-accent-red to-secondary text-white shadow-[0_5px_15px_rgba(143,1,119,0.3)] -translate-y-0.5' 
            : 'text-primary hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm'"
        >
          {{ item }}
        </button>
      </li>

      <!-- ปุ่ม Next -->
      <li class="inline-flex" :class="{ 'pointer-events-none': currentPage === totalPages }">
        <button
          type="button"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="border-none font-bold rounded-lg w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all text-[0.95rem] cursor-pointer"
          :class="currentPage === totalPages ? 'text-gray-300 bg-transparent cursor-default' : 'text-primary hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm'"
          aria-label="Next Page"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </li>
    </ul>
  </nav>
</template>