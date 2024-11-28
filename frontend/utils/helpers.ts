
// utils/helpers.ts

export function handleScroll(callback: (scrollY: number) => void) {
  const onScroll = () => {
    const scrollY = window.scrollY;
    callback(scrollY);
  };

  window.addEventListener("scroll", onScroll);

  return () => {
    // Cleanup function to remove the event listener
    window.removeEventListener("scroll", onScroll);
  };
}
