const messages = [
  "Free shipping on orders over ₹999",
  "Easy 15-day returns",
  "New autumn arrivals every week",
];

/** Thin service bar above the header: one message on mobile, all three on desktop. */
export function AnnouncementBar() {
  return (
    <div className="bg-ink text-paper">
      <ul className="page-container-wide flex h-8 items-center justify-center gap-10 text-2xs tracking-wide uppercase lg:justify-between">
        {messages.map((message, i) => (
          <li key={message} className={i === 0 ? undefined : "hidden lg:block"}>
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
