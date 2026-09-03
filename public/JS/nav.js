function goTo(screenId) {
  const current = document.querySelector(".screen.active");
  const target = document.getElementById(screenId);
  if (!target || target === current) return;

  if (current) {
    current.classList.remove("visible");
    setTimeout(() => {
      current.classList.remove("active");
    }, 500);
  }

  target.classList.add("active");
  void target.offsetWidth;
  target.classList.add("visible");
  window.scrollTo(0, 0);
}
