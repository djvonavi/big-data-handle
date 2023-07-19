import { ref } from "vue";

// composition to use loading animated statuses anywhere

export function useLoadingStatus() {
  const loadingStatus = ref("");

  let timerLoading = 0;

  function startLoading(text: string, dotsCount = 0) {
    clearTimeout(timerLoading);
    loadingStatus.value = text.padEnd(text.length + dotsCount, ".");
    timerLoading = setTimeout(() => {
      startLoading(text, dotsCount === 3 ? 0 : (dotsCount += 1));
    }, 250);
  }

  function stopLoading() {
    clearTimeout(timerLoading);
    loadingStatus.value = "";
  }

  return { loadingStatus, startLoading, stopLoading };
}
