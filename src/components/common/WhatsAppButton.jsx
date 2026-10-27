

export default function WhatsAppButton() {
  // Egyptian WhatsApp customer support details and default inquiry
  const phoneNumber = '201035401549';
  const defaultMessage = 'السلام عليكم، أود الاستفسار عن منتجات متجر بيبي زون (Baby Zone)';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-20 sm:bottom-7 left-4 sm:left-7 z-40 group select-none"
    >
      {/* Floating circular anchor for direct whatsapp chat */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.65)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="تواصل معنا عبر واتساب مباشرة"
        title="تواصل معنا عبر واتساب"
      >
        {/* Radar ping animation effect */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none"
          aria-hidden="true"
        />

        {/* Official whatsapp vector icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10 filter drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.187 1.564 5.946l-1.564 5.854 6.046-1.587c1.701.928 3.655 1.458 5.733 1.458 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
        </svg>

        {/* Live online status badge */}
        <span
          className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full z-20 shadow-xs"
          title="خدمة العملاء متصلة الآن"
        />

        {/* Expandable tooltip on desktop hover */}
        <div className="hidden sm:flex items-center gap-2 absolute right-auto left-full ml-3 px-3.5 py-2 rounded-2xl bg-white shadow-soft-xl border border-rawaa-border text-xs font-bold text-rawaa-dark whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>تحدثي معنا عبر واتساب</span>
        </div>
      </a>
    </aside>
  );
}
