export function Footer() {
  return (
    <footer className="mt-10 space-y-4 px-6 pb-28 text-center text-xs text-muted">
      <div className="flex items-center justify-center gap-2 text-sm text-white">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[10px]">▶</span>
        negun
      </div>
      <p className="flex flex-wrap justify-center gap-3">
        <a>Бидний тухай</a>
        <a>Нууцлал</a>
        <a>Нөхцөл</a>
        <a>Холбоо барих</a>
        <a>Ажлын байр</a>
      </p>
      <p>© 2024 Negun Technologies. Бүх эрх хуулиар хамгаалагдсан.</p>
    </footer>
  );
}
